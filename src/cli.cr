require "option_parser"
require "./handlers/*"

module JuliboxTV
  def run()
    mock = false
    mock_game = nil : String?
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
      raise "Proxy mode not implemented" if proxy
      LOG.info { "Mocking #{mock_game}; join with any code" } if mock

      file_handler = HTTP::StaticFileHandler.new("src/assets/", directory_listing = false)
    
      asset_proxy_handler = ProxyHandler.new("jackbox.tv", "http://127.0.0.1:8080", "127.0.0.1:8080")

      server = HTTP::Server.new [HTTP::ErrorHandler.new, HTTP::LogHandler.new, WSMocker.handler, HTTP::CompressHandler.new, IndexHandler.new, file_handler, asset_proxy_handler]

      address = server.bind_tcp 8080
      LOG.info { "Listening on http://#{address}" }
      server.listen
    else
      puts parser
      exit(1)
    end
  end
end