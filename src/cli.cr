require "option_parser"
require "colorize"
require "log"
require "./config"
require "./mods/mod.cr"
require "./handlers/*"
require "./mock/*"

module JuliboxTV

  struct LogFormat < Log::StaticFormatter
    def severity_color(severity : Log::Severity) : Colorize::Object
      case severity
      when .trace?
        Colorize.with.dark_gray
      when .debug?
        Colorize.with.dark_gray
      when .info?
        Colorize.with.cyan
      when .notice?
        Colorize.with.light_green
      when .warn?
        Colorize.with.yellow
      when .error?
        Colorize.with.red
      when .fatal?
        Colorize.with.light_red
      else
        Colorize.with.white
      end
    end

    def run
      severity_color(@entry.severity).surround(@io) do
        @entry.severity.label.rjust(@io, 6)
      end
      string "  "
      Colorize.with.white.surround(@io) do
        source
      end
      string "  "
      message
      exception
    end
  end

  @@paranoid_reload = false

  def paranoid_reload
    @@paranoid_reload
  end

  def run()
    Log.setup_from_env(backend: Log::IOBackend.new(formatter: LogFormat), default_level: :debug)
  
    mock = false
    mock_game = nil : String?
    mock_args = [] of String
    proxy = false
    cli_mods = [] of String
    cli_mod_paths = [] of String
    force_rewrite = false
    disable_cache = false

    parser = OptionParser.new do |parser|
      parser.banner = "Usage: julibox [subcommand] [arguments]"
      parser.on("mock", "Mock a Jackbox game locally for debugging or testing purposes (see src/mock/ for valid options)") do
        mock = true
        parser.banner = "Usage: julibox mock [game] [arguments]"
        parser.unknown_args do |args|
          if args.size == 0
            puts parser
            exit(1)
          end

          mock_game = args[0]
          mock_args = args[1..]
        end
      end
      parser.on("proxy", "Proxy Jackbox games through this server") do
        proxy = true
        parser.banner = "Usage: julibox proxy [arguments]"
      end
      parser.on("-h", "--help", "Show this help") do
        puts parser
        exit
      end
      parser.on("-m MODS", "--mods MODS", "Include mods, searched for through mod_paths") do |mods_str|
        cli_mods = mods_str.split(",", remove_empty: true)
      end
      parser.on("--mod-paths MOD_PATHS", "Include mod paths into the search list for mods") do |mods_str|
        cli_mod_paths = mods_str.split(",", remove_empty: true)
      end
      parser.on("--force-config-rewrite", "Force a config rewrite to fix formatting and comments") do
        force_rewrite = true
      end
      parser.on("--no-cache", "Disable caching headers for development ease") do
        disable_cache = true
      end
      parser.on("--paranoid-reload", "Keep reloading mods' variables _constantly_ on each request. Not recommended for anywhere except development") do
        @@paranoid_reload = true
      end
    end
    
    parser.parse
    
    if mock || proxy
      mod_paths = (CONFIG.get_config.get("mod_paths").as(String).split(",", remove_empty: true) | cli_mod_paths).map { |m| Path[m].normalize }
      mod_names = CONFIG.get_config.get("mods").as(String).split(",", remove_empty: true) | cli_mods

      mods = mod_names.map do |name|
        search_paths = mod_paths.map { |path| path / name / "mod.julibox.json" }
        mod_filepath = search_paths.find { |path| File.exists?(path) }

        if mod_filepath == nil
          LOG.error { "Mod '#{name}' not found!" }
          LOG.error { "Searched paths: #{(search_paths.map &.to_s).join(", ")}" }
          exit 1
        end

        LOG.debug { "Found mod '#{name}' in #{mod_filepath}" }

        json = JSON.parse(File.read(mod_filepath.not_nil!))
        mod = Mod.new(mod_filepath.not_nil!)
        CONFIG.init_mod(mod.slug, mod.config)
        mod
      end

      CONFIG.evaluate_mods!

      mods.each do |mod|
        mod.set_config!(CONFIG.get_config(mod.slug))
        mod.evaluate_variables!
      end

      CONFIG.mark_dirty! if force_rewrite
      CONFIG.finalize

      LOG.info { "Loaded #{mods.size} mods successfully!" }

      if mock
        # todo: keep a record of lobbies somehow?
        lobby = LobbyInfo.new "AAAA"

        case mock_game
        when "nopus-opus"
          mocker = NopusOpusMocker.new lobby
        else
          raise "No mocker found for #{mock_game}"
        end

        ws_handler = WSMockHandler.new mocker
        LOG.notice { "Mocking #{mock_game.to_s.colorize(:cyan)}, join with any code" }
      else
        raise "Proxy mode not implemented"
      end

      asset_handler = AssetHandler.new(mods, disable_cache: disable_cache)
      proxy_handler = ProxyHandler.new("jackbox.tv", "http://127.0.0.1:8080", "127.0.0.1:8080", mods, disable_cache: disable_cache)

      server = HTTP::Server.new [
        HTTP::ErrorHandler.new(verbose: true),
        HTTP::LogHandler.new,
        ws_handler.handler,
        HTTP::CompressHandler.new,
        asset_handler,
        proxy_handler
      ]

      address = server.bind_tcp 8080
      LOG.info { "Listening on #{"http://#{address}".colorize(:cyan)}" }
      server.listen
    else
      puts parser
      exit(1)
    end
  end
end