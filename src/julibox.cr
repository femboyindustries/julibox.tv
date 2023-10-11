require "./cli.cr"
require "./config.cr"

module JuliboxTV
  extend self

  APPLICATION_NAME = "julibox"

  def trunc(str : String, max_size = 200)
    str = str.strip
    max_size = Math.min(max_size, (str.index('\n') || (max_size + 1)) - 1)
    str[0..max_size] + (str.size > max_size ? "..." : "")
  end

  VERSION = "0.1.0"
  LOG = ::Log.for(APPLICATION_NAME)

  CONFIG = Config::JuliboxConfig.new(APPLICATION_NAME)
  CONFIG.init_app([
    # todo: how do you make this lets of a config mouthful
    Config::ConfigOption.new(
      "mods",
      Config::ConfigOption::ConfigType::String,
      "A comma-seperated list of mod names to apply\njulibox will search through every path in mod_paths for these mods"
    ),
    Config::ConfigOption.new(
      "mod_paths",
      Config::ConfigOption::ConfigType::String,
      "A comma-seperated list of paths to search for mods through\nSupports relative paths from the working directory",
      default: "./mods,#{Config.get_config_path(APPLICATION_NAME) / "mods"}"
    ),
    Config::ConfigOption.new(
      "paranoid_load",
      Config::ConfigOption::ConfigType::Boolean,
      "Whether to keep reloading mods' variables _constantly_ on each request.\nNot recommended for anywhere except development",
      default: "false"
    )
  ])
end

JuliboxTV.run