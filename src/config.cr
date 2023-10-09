require "file_utils"
require "./mods/mod.cr"
require "./commented_ini.cr"

module JuliboxTV::Config
  extend self

  APPLICATION_NAME = "julibox"

  def get_config_path : Path
    {% if flag?(:windows) %}
      Path.new(ENV["APPDATA"]) / APPLICATION_NAME
    {% elsif flag?(:macosx) %}
      Path.home / "Library" / "Application Support" / APPLCATION_NAME
    {% elsif flag?(:unix) %}
      (ENV["XDG_CONFIG_HOME"]?.try { |p| Path.new(p) } || (Path.home / ".config")) / APPLICATION_NAME
    {% end %}
  end

  @@app_configs = [
    Mod::ConfigOption.new("mods", Mod::ConfigOption::ConfigType::String, "A comma-seperated list of mods to apply")
  ]

  @@config = {} of String => CommentedINI::Value
  @@mod_configs = {} of String => Hash(String, CommentedINI::Value)

  def init(mod_configs : Hash(String, Array(Mod::ConfigOption)))
    config_path = get_config_path
    FileUtils.mkdir_p(config_path)

    config_file = config_path / "mods.ini"

    write_file = false
    if File.exists?(config_file)
      config = CommentedINI.parse(File.read(config_file))
    else
      write_file = true
      config = Hash(String, Hash(String, CommentedINI::Value)).new
      config[""] = {} of String => CommentedINI::Value
    end

    @@config, should_rewrite = merge_options(config[""], @@app_configs)
    write_file ||= should_rewrite
    mod_configs.each do |mod, cfg|
      @@mod_configs[mod], should_rewrite = merge_options(config[mod]? || {} of String => CommentedINI::Value, cfg)
      write_file ||= should_rewrite
    end

    if should_rewrite
      File.write(config_file, CommentedINI.build(@@mod_configs.merge({"" => @@config}), space: true))
    end
  end

  def get_config(key : String)
    if key == ""
      @@config
    else
      @@mod_configs[key]
    end
  end

  def format_comment(option : Mod::ConfigOption)
    "#{option.description || "No description provided"} (#{option.type.to_s.downcase}#{option.default ? ", default #{option.default}" : ""})"
  end

  def merge_options(options : Hash(String, CommentedINI::Value), target_config : Array(Mod::ConfigOption)) : Tuple(Hash(String, CommentedINI::Value), Bool)
    new_options = {} of String => CommentedINI::Value

    should_rewrite = false

    target_config.each do |opt|
      should_rewrite = true if !options.has_key?(opt.name)

      if opt.default
        new_options[opt.name] = {opt.default.not_nil!, format_comment(opt)}
      else
        new_options[opt.name] = {"", format_comment(opt)}
      end
    end
    options.each do |key, opt|
      new_options[key] = opt
    end

    return new_options, should_rewrite
  end
end