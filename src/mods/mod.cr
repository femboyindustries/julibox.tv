require "json"
require "semantic_version"
require "../config.cr"

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

    getter config : Array(Config::ConfigOption)

    def parse_config(configs : Array(JSON::Any))
      configs.map { |c| Config::ConfigOption.new c.as_h }
    end

    alias Variable = String | Float64 | Bool | Nil
    alias Variables = Hash(String, Variable)

    struct VariableDefintion
      enum VariableType
        Value
        File
      end

      getter type : VariableType

      def initialize(@raw : Hash(String, JSON::Any), @dir : Path)
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
      map.transform_values { |v| VariableDefintion.new(v.as_h, @filepath.parent) }
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

    def initialize(@filepath : Path, quiet : Bool = false)
      json = File.open(@filepath) do |file|
        JSON.parse(file)
      end
      initialize(json, @filepath, quiet)
    end
    def initialize(json : JSON::Any, @filepath : Path, quiet : Bool = false)
      @slug, @version, @display_name, @description, @author, @license, @dependencies = parse_metadata(json["metadata"].as_h)
      @config = parse_config(json["config"].as_a)
      @variable_definitions = parse_variables(json["variables"].as_h)
      @rules = parse_rules(json["rules"].as_a)

      @log = LOG.for(slug)
      @log.info { "Loaded #{display_name.colorize(:cyan)} #{version} w/ #{rules.size} rules" } if !quiet
    end

    def set_config!(@user_config : Config::Configurator)
      @user_config.not_nil!.values.each do |name, val|
        @variables[name] = val
      end
    end

    def evaluate_variables!
      variable_definitions.each do |name, var|
        val = var.evaluate @variables
        @variables[name] = val
        @log.debug { "var.#{name.colorize(:cyan)} = #{JuliboxTV.trunc val.to_s}" }
      end
      @variables_evaluated = true

      @log.info { "Evaluated #{variables.size} variables" }
    end

    def should_process(filepath : String)
      rules.any? &.matches_filepath(filepath)
    end

    def process(filepath : String, body : String)
      if CONFIG.get_config.get("paranoid_load")
        @log.debug { "Paranoidly reloading mod" }
        initialize(@filepath, quiet: true)
        @variables = {} of String => Variable
        @user_config.not_nil!.evaluate!
        set_config!(@user_config.not_nil!)
        evaluate_variables!
      end

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