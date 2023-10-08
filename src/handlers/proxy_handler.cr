require "http"
require "http/server/handler"

module JuliboxTV
  class ProxyHandler
    include HTTP::Handler
  
    def initialize(@target : String, @source_url : String, @source_origin : String)
    end
  
    def should_intercept_body?(request : HTTP::Request)
      request.path.ends_with?(".js") || request.path.starts_with?("/api/")
    end
  
    def rewrite_body(request : HTTP::Request, body : String) : String
      if request.path.ends_with?(".js")
        body = body.sub("https://bundles.jackbox.tv/", @source_url + "/bundles/")
        body = body.sub("ecast.jackboxgames.com", @source_origin)
        if @source_url.starts_with?("http://")
          body = body.sub("scheme:\"https\"", "scheme:\"http\"")
          body = body.sub("e.scheme:this.scheme=\"wss\"", "e.scheme:this.scheme=\"ws\"")
        end
        body = body.sub("const LTe=ct(ETe", ";const $$penis=#{File.read("mods/nopus-component.js")};const LTe=ct($$penis")
        body = body.sub("\"render\",$Te", "\"render\",#{File.read("mods/nopus-render.js")}")
      end
  
      if request.path.starts_with?("/api/")
        if request.path.starts_with?("/api/v2/rooms/")
          json = JSON.parse(File.read("src/assets/game.json"))
        else
          json = JSON.parse(body)
          if !json["ok"].as_bool || !(json["body"]?.try &.as_h?)
            return body
          end
        end
  
        if request.path.starts_with?("/api/v2/rooms/")
          json["body"].as_h["host"] = JSON::Any.new "#{@source_origin}/#{json["body"]["host"]}"
          # todo: audience support (is this really necessary)
        end
  
        return json.to_json
      end
  
      body
    end
  
    def transform_req_path(path : String)
      if path.starts_with?("/bundles/")
        return "https://bundles.jackbox.tv/" + path.lchop("/bundles/")
      end
      if path.starts_with?("/api/v2")
        return "https://ecast.jackboxgames.com" + path
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
  
      # should we intercept the body?
      if should_intercept_body?(req)
        req.headers["Accept-Encoding"] = "" # too lazy to ungzip
  
        response = HTTP::Client.exec(req.method, orig_url, req.headers, req.body)
        
        # proxy everything but the body
        context.response.status = response.status
        context.response.headers.merge!(response.headers)
        # fuck cors
        context.response.headers["Access-Control-Allow-Origin"] = "*"
        # don't pretend to send gzipped data
        context.response.headers.delete("Content-Encoding")
        # don't pretend to send chunked data
        context.response.headers.delete("Transfer-Encoding")
  
        # intercept the body
        new_body = rewrite_body(req, response.body)
        # DON'T FORGET
        context.response.content_length = new_body.bytesize
        context.response << new_body
  
        context.response.close
      else
        HTTP::Client.exec(req.method, orig_url, req.headers, req.body) do |response|
          # proxy everything
          context.response.status = response.status
          context.response.headers.merge!(response.headers)
          # fuck cors
          context.response.headers["Access-Control-Allow-Origin"] = "*"
          # don't pretend to send chunked data
          context.response.headers.delete("Transfer-Encoding")
  
          IO.copy(response.body_io, context.response) if response.body_io
  
          context.response.close
        end
      end
    end
  end
end