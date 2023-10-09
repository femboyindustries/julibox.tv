require "json"
require "semantic_version"

module JuliboxTV
  class Mod
    getter slug : String
    getter version : SemanticVersion
    getter display_name : String
    getter description : String?
    getter author : String?
    getter license : String?
    getter dependencies : Hash(String, String)

    def parse_metadata(m : Hash(String, JSON::Any))
      return m["slug"].as_s,
        SemanticVersion.parse(m["version"].as_s),
        m["displayName"].as_s,
        m["description"]?.try &.as_s?,
        m["author"]?.try &.as_s?,
        m["license"]?.try &.as_s?,
        m["dependencies"].as_h.transform_values &.as_s
    end

    struct ConfigOption
      enum ConfigType
        Boolean
        String
        Number
        Filepath
      end

      getter name : String
      getter type : ConfigType
      getter description : String?
      getter variable : String?
      getter default : String? # not yet parsed, so it's a string
      getter required : Bool

      def initialize(option : Hash(String, JSON::Any))
        @name = option["name"].as_s
        @type = ConfigType.parse option["type"].as_s
        @description = option["description"]?.try &.as_s?
        @variable = option["variable"]?.try &.as_s?
        @default = option["default"]?.try &.as_s?
        @required = option["required"]?.try &.as_bool? || false
      end
      def initialize(@name : String, @type : ConfigType, @description : String? = nil, @default : String? = nil, @required : Bool = false)
      end

      def parse_value(value : String) : Variable
        case @type
        when ConfigType::Boolean
          value.downcase == "true"
        when ConfigType::String
          value
        when ConfigType::Number
          value.to_f64
        when ConfigType::Filepath
          File.read(Path[value].normalize)
        else
          raise NotImplementedError.new "Parser for #{@type} not yet implemented"
        end
      end
    end

    getter config : Array(ConfigOption)

    def parse_config(configs : Array(JSON::Any))
      configs.map { |c| ConfigOption.new c.as_h }
    end

    alias Variable = String | Float64 | Bool | Nil
    alias Variables = Hash(String, Variable)

    struct VariableDefintion
      enum VariableType
        Value
        File
      end

      getter type : VariableType

      def initialize(@dir : Path, @raw : Hash(String, JSON::Any))
        @type = VariableType.parse @raw["type"].as_s
      end

      def evaluate(vars : Variables) : Variable
        case @type
        when VariableType::File
          File.read(@dir / @raw["file"].as_s)
        else
          raise NotImplementedError.new "Evaluation of variable of type #{@type} not yet implemented"
        end
      end
    end

    # Load-time definitions
    getter variable_definitions : Hash(String, VariableDefintion)
    # Runtime values
    @variables = {} of String => Variable
    @variables_evaluated = false
    def variables
      raise "Variables have not been evaluated! Please run mod.evaluate_variables!" if !@variables_evaluated
      @variables
    end

    def parse_variables(map : Hash(String, JSON::Any))
      map.transform_values { |v| VariableDefintion.new(@dir, v.as_h) }
    end

    def self.substitute_variables(str : String, vars : Variables)
      str.gsub(/\${([a-zA-Z_-][a-zA-Z0-9_-]*)}/) do |_, regex|
        key = regex[1]
        var = vars[key]?
        if !vars.has_key?(key)
          LOG.warn { "Mod uses undefined variable #{key}" }
        end
        var.to_s || "null"
      end
    end

    abstract struct Action
      abstract def transform(a : String, ctx : Variables) : String
      def self.from(action : Hash(String, JSON::Any)) : Action
        case action["type"].as_s
        when "find-replace"
          FindReplaceAction.new(action["find"].as_s, action["replace"].as_s)
        else
          raise "Unknown action type #{action["type"].as_s}"
        end
      end
    end

    struct FindReplaceAction < Action
      def initialize(@find : String, @replace : String)
      end
      def transform(a : String, ctx : Variables) : String
        b = a.sub(@find, Mod.substitute_variables(@replace, ctx))
        raise "No pattern found in source string" if a == b
        b
      end
    end

    struct Rule
      getter slug : String?
      getter filename : String
      getter required : Bool
      getter action : Action

      def initialize(@raw : Hash(String, JSON::Any))
        @slug = @raw["slug"]?.try &.as_s?
        @filename = @raw["filename"].as_s
        @required = @raw["required"]?.try &.as_bool? || false
        @action = Action.from(@raw["action"].as_h)
      end

      def matches_filepath(path : String) : Bool
        # todo: this sucks
        Regex.new(Regex.escape(@filename).gsub(/(?<!\\)\\\*/, ".+") + "$").matches?(path)
      end

      def transform(a : String, ctx : Variables) : String
        action.transform(a, ctx)
      end
    end

    getter rules : Array(Rule)

    def parse_rules(rules : Array(JSON::Any))
      rules.map { |r| Rule.new r.as_h }
    end

    getter log : Log

    def initialize(@dir : Path, json : JSON::Any)
      @slug, @version, @display_name, @description, @author, @license, @dependencies = parse_metadata(json["metadata"].as_h)
      @config = parse_config(json["config"].as_a)
      @variable_definitions = parse_variables(json["variables"].as_h)
      @rules = parse_rules(json["rules"].as_a)

      @log = LOG.for(slug)
      @log.info { "Loaded #{display_name} #{version} w/ #{rules.size} rules" }
    end

    def evaluate_config!(user_config : Hash(String, String))
      @config.each do |option|
        str = user_config[option.name]?
        if option.required && (str == nil || str.not_nil!.strip == "")
          raise "Option #{option.name} is required, but no value was given"
        end

        @variables[option.variable.not_nil!("Option #{option.name} does not specify variable name")] = option.parse_value(str.not_nil!)
      end
    end

    def evaluate_variables!
      variable_definitions.each do |name, var|
        val = var.evaluate @variables
        @variables[name] = val
        @log.debug { "#{name} = #{JuliboxTV.trunc val.to_s}" }
      end
      @variables_evaluated = true

      @log.info { "Evaluated #{variables.size} variables" }
    end

    def should_process(filepath : String)
      rules.any? &.matches_filepath(filepath)
    end

    def process(filepath : String, body : String)
      rules.each do |rule|
        if rule.matches_filepath(filepath)
          begin
            body = rule.transform(body, variables)
          rescue ex
            if rule.required
              @log.error { "Failed to apply rule #{rule.slug}: #{ex.message}" }
              return body
            else
              @log.warn { "Failed to apply rule #{rule.slug}: #{ex.message}" }
            end
          else
            @log.debug { "Applied rule #{rule.slug}" }
          end
        end
      end
      body
    end
  end
end