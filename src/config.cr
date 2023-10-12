require "file_utils"
require "./mods/mod.cr"
require "./commented_ini.cr"

module JuliboxTV::Config
  extend self

  def merge_options(options : Hash(String, CommentedINI::Value), target_config : Array(ConfigOption)) : Tuple(Hash(String, CommentedINI::Value), Bool)
    new_options = {} of String => CommentedINI::Value

    should_rewrite = false

    target_config.each do |opt|
      should_rewrite = true if !options.has_key?(opt.name)

      if opt.default
        new_options[opt.name] = {opt.default.not_nil!, opt.format_comment}
      else
        new_options[opt.name] = {"", opt.format_comment}
      end
    end
    options.each do |key, opt|
      orig_cfg = target_config.find { |cfg| cfg.name == key }

      if orig_cfg
        new_options[key] = {opt[0], orig_cfg.not_nil!.format_comment}
      else
        new_options[key] = opt
      end
    end

    return new_options, should_rewrite
  end

  def get_config_path(app_name : String) : Path
    {% if flag?(:windows) %}
      Path.new(ENV["APPDATA"]) / app_name
    {% elsif flag?(:macosx) %}
      Path.home / "Library" / "Application Support" / app_name
    {% elsif flag?(:unix) %}
      (ENV["XDG_CONFIG_HOME"]?.try { |p| Path.new(p) } || (Path.home / ".config")) / app_name
    {% end %}
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

    def parse_value(value : String) : Mod::Variable
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

    def format_comment
      "#{description || "No description provided"} (#{type.to_s.downcase}#{default ? ", default #{default}" : ""})"
    end
  end

  class JuliboxConfig
    @dirty_config = false
    @ini : Hash(String, Hash(String, CommentedINI::Value))

    @app_data = {} of String => CommentedINI::Value
    @mods_data = {} of String => Hash(String, CommentedINI::Value)

    @app_config : Configurator?
    @mod_configs = {} of String => Configurator

    def initialize(@application_name : String)
      FileUtils.mkdir_p(config_path)

      if File.exists?(config_file)
        @ini = CommentedINI.parse(File.read(config_file))
      else
        LOG.info { "Config not found, will create" }
        mark_dirty!
        @ini = CommentedINI.parse("")
      end
    end

    def config_path
      Config.get_config_path(@application_name)
    end
    def config_file
      config_path / "mods.ini"
    end
  
    def init_app(app_definitions : Array(ConfigOption))
      @app_data, should_rewrite = Config.merge_options(@ini[""], app_definitions)
      mark_dirty! if should_rewrite
      @app_config = Configurator.new(@app_data.transform_values &.[0], app_definitions)
    end
  
    def init_mod(mod : String, mod_definition : Array(ConfigOption))
      @mods_data[mod], should_rewrite = Config.merge_options(@ini[mod]? || {} of String => CommentedINI::Value, mod_definition)
      mark_dirty! if should_rewrite
      @mod_configs[mod] = Configurator.new(@mods_data[mod].transform_values &.[0], mod_definition, mod)
    end
  
    def mark_dirty!
      @dirty_config = true
    end

    def finalize
      if @dirty_config
        LOG.info { "Writing config updated with new options to #{config_file}" }
        File.write(config_file, CommentedINI.build(@mods_data.merge({"" => @app_data}), space: true))
      end
    end

    def evaluate_app!
      get_config.evaluate!
    end
    def evaluate_mods!
      @mod_configs.each_value &.evaluate!
    end

    def get_config
      @app_config.not_nil!("App config not initialized")
    end
    def get_config(mod : String)
      @mod_configs[mod]
    end
  end

  class Configurator
    getter config : Hash(String, String)
    getter target : Array(ConfigOption)
    @values = {} of String => Mod::Variable
    @evaluated = false

    def initialize(@config : Hash(String, String), @target : Array(ConfigOption), @name : String? = nil)
    end

    def evaluate!
      @target.each do |option|
        str = @config[option.name]?
        if option.required && (str == nil || str.not_nil!.strip == "")
          raise "Option #{option.name} is required, but no value was given"
        end
  
        name = option.variable || option.name
        val = option.parse_value(str.not_nil!)
        @values[name] = val
        LOG.debug { "cfg.#{@name ? "#{@name}." : ""}#{name.colorize(:cyan)} = #{JuliboxTV.trunc val.to_s}" }
      end

      @evaluated = true
    end

    def get(key : String)
      raise "Config not evaluated, please run evaluate! first" if !@evaluated
      values[key]
    end
    def values
      raise "Config not evaluated, please run evaluate! first" if !@evaluated
      @values
    end
  end
end