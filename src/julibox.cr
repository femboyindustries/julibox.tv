require "uri"
require "http"
require "http/server/handler"
require "http/web_socket"

log_handler = HTTP::LogHandler.new

ws_handler = HTTP::WebSocketHandler.new do |ws, ctx|
  ws.on_ping { ws.pong }
  ws.on_message do |msg|
    puts msg
  end
end

class IndexHandler
  include HTTP::Handler

  def call(context)
    if context.request.path == "/"
      context.request.path = "/index.html"
    end
    call_next(context)
  end
end

index_handler = IndexHandler.new

file_handler = HTTP::StaticFileHandler.new("src/assets/", directory_listing = false)

def source_url
  "http://127.0.0.1:8080"
end

class ProxyHandler
  include HTTP::Handler

  def initialize(@target : String)
  end

  def should_intercept_body?(request : HTTP::Request)
    if request.path.ends_with?(".js")
      true
    end
  end

  def rewrite_body(request : HTTP::Request, body : String) : String
    if request.path.ends_with?(".js")
      body = body.sub("https://bundles.jackbox.tv/", source_url + "/bundles/")
      body = body.sub("ecast.jackboxgames.com", source_url.sub("http://", "").sub("https://", ""))
    end
    body
  end

  def transform_req_path(path : String)
    if path.starts_with?("/bundles/")
      return "https://bundles.jackbox.tv/" + path.lchop("/bundles/")
    end
    "https://#{@target}#{path}"
  end

  def call(context)
    req = context.request.dup

    # redirect
    orig_url = transform_req_path(req.path)
    # we don't want to look stupid walking up to jackbox and going "hey is this 127.0.0.1:8080"
    uri = URI.parse(orig_url)
    req.headers["Host"] = uri.host.not_nil!
    req.headers["Origin"] = "https://#{@target}"
    req.headers["Accept-Encoding"] = "" # too lazy to ungzip

    # should we intercept the body?
    if should_intercept_body?(req)
      response = HTTP::Client.exec(req.method, orig_url, req.headers, req.body)
      
      # proxy everything but the body
      context.response.status = response.status
      context.response.headers.merge!(response.headers)

      # intercept the body
      new_body = rewrite_body(req, response.body)
      context.response << new_body

      context.response.close
    else
       HTTP::Client.exec(req.method, orig_url, req.headers, req.body) do |response|
        # proxy everything
        context.response.status = response.status
        context.response.headers.merge!(response.headers)

        IO.copy(response.body_io, context.response)

        context.response.close
      end
    end
  end
end

asset_proxy_handler = ProxyHandler.new "jackbox.tv"

server = HTTP::Server.new [log_handler, ws_handler, index_handler, file_handler, asset_proxy_handler]

address = server.bind_tcp 8080
puts "Listening on http://#{address}"
server.listen