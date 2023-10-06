require "./handlers/*"

module JuliboxTV
  extend self

  VERSION = "0.1.0"
  LOG = ::Log.for("julibox")

  def run()
    file_handler = HTTP::StaticFileHandler.new("src/assets/", directory_listing = false)
    
    asset_proxy_handler = ProxyHandler.new("jackbox.tv", "http://127.0.0.1:8080", "127.0.0.1:8080")

    server = HTTP::Server.new [HTTP::ErrorHandler.new, HTTP::LogHandler.new, WSMocker.handler, HTTP::CompressHandler.new, IndexHandler.new, file_handler, asset_proxy_handler]

    address = server.bind_tcp 8080
    LOG.info { "Listening on http://#{address}" }
    server.listen    
  end
end

JuliboxTV.run