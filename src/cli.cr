require "option_parser"
require "colorize"
require "log"
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
        Colorize.with.cyan
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
      Colorize.with.light_gray.dim.surround(@io) do
        timestamp
      end
      string "  "
      severity_color(@entry.severity).surround(@io) do
        @entry.severity.label.rjust(@io, 6)
      end
      string "  "
      Colorize.with.white.surround(@io) do
        source
      end
      string "  "
      message
    end
  end

  def run()
    Log.setup_from_env(backend: Log::IOBackend.new(formatter: LogFormat), default_level: :debug)
  
    mock = false
    mock_game = nil : String?
    mock_args = [] of String
    proxy = false
    #mods = [] of ???

    parser = OptionParser.new do |parser|
      parser.banner = "Usage: julibox [subcommand] [arguments]"
      parser.on("mock", "Mock a Jackbox game locally for debugging or testing purposes (see src/mock/ for valid options)") do
        mock = true
        parser.banner = "Usage: julibox mock [game] [arguments]"
        parser.unknown_args do |args|
          #if args.size == 0
          #  puts parser
          #  exit(1)
          #end

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
      #parser.on("-m MODS", "--mods MODS", "Include mods (see mods/ for valid options)") do |mods|
      #
      #end
    end
    
    parser.parse
    
    if mock || proxy
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

      file_handler = HTTP::StaticFileHandler.new("src/assets/", directory_listing: false)
    
      asset_proxy_handler = ProxyHandler.new("jackbox.tv", "http://127.0.0.1:8080", "127.0.0.1:8080")

      server = HTTP::Server.new [
        HTTP::ErrorHandler.new(verbose: true),
        HTTP::LogHandler.new,
        ws_handler.handler,
        HTTP::CompressHandler.new,
        IndexHandler.new,
        file_handler,
        asset_proxy_handler
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