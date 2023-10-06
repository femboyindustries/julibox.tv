require "uri"
require "json"
require "uuid"
require "http"
require "http/server/handler"
require "http/web_socket"

class WSSender
  @pc = 1
  @versions = {} of String => Int32
  
  def initialize(@ws : HTTP::WebSocket)
  end

  def send(opcode : String, result)
    @ws.send({
      "pc" => @pc,
      "opcode" => opcode,
      "result" => result
    }.to_json)
    @pc += 1
  end
  def send(opcode : String, key : String, val, version : Int32? = nil, from = 1)
    version = version || @versions["key"]? || 0
    send(opcode, {"key" => key, "val" => val, "version" => version, "from" => from})
    @versions["key"] = version + 1
  end
end

ws_handler = HTTP::WebSocketHandler.new do |ws, ctx|
  q = ctx.request.query_params

  role = q["role"]?
  if role != "player"
    raise "Role #{role} unsuppored"
  end
  player_name = q["name"]?.try &.upcase || "PLAYER"
  user_id = q["user-id"]?.try { |s| UUID.new(s) } || UUID.random
  format = q["format"]?
  if format != "json"
    raise "Format #{format} unsuppored"
  end
  
  d = WSSender.new ws

  d.send("client/welcome", JSON.parse(
    File.read("src/assets/lobby-sample.json")
      # this isn't the worst way to do this! but it _is_ close
      .sub("<PLAYER>", player_name)
      # exclusively relevant to reconnections
      .sub("<SECRET>", UUID.random)
      # idk what this is based on
      .sub("<DEVICEID>", "0366929ab8.8773612ac287d0d5de4a2a")
  ))

  chart = JSON.parse(File.read("src/assets/chart.json"))
  # todo
  selected_beatmap = chart["beatmaps"][0]

  # todo: is sending both necessary?
  d.send("object", "connectedPlayers", {"2" => {"avatar" => 0, "id" => 2, "inSong" => false, "name" => player_name}})
  d.send("object", "connectedPlayers", {"2" => {"avatar" => 0, "beatmapSlug" => selected_beatmap["slug"], "id" => 2, "inSong" => false, "instrumentSlug" => chart["slug"], "name" => player_name}})

  d.send("object", "beatmap:#{selected_beatmap["slug"]}", {
    "config" => selected_beatmap,
    "scaleKey" => chart["scaleKey"],
    "scaleType" => chart["scaleType"],
    "songName" => "Tutorial" # todo: how?
  })
  d.send("object", "instrument:#{chart["slug"]}", {
    "config" => {
      "capabilities" => ["Melodic", "Sustain"], # ???
      "chains" => [
        # todo: keysounds?
      ] of Nil,
      "slug" => chart["slug"]
    },
    "name" => "Tutorial Sampler" # ???
  })
  d.send("object", "guide", {
    "guide" => chart["guide"]
  })

  d.send("object", "recording:2", {} of Nil => Nil)
  d.send("object", "player:2", {
    "guide" => {"$ref" => "guide"},
    "kind" => "recording",
    "recordingInfo" => {"$ref" => "recordingInfo"},
    "responseEntity" => "recording:2"
  })

  d.send("object", "recordingInfo", {
    "continuousCriteriaFactors" => [1,0.5,0.25,0],
    "continuousPercentageCriteria" => [60,45,30],
    "continuousSignalCriteria" => [0.03,0.08,0.12],
    "countInIndex" => 1,
    "discreteCriteria" => [80,120,160],
    "duration" => chart["duration"],
    "guideStartOffset" => chart["guideStartOffset"],
    "inputWindow" => 160.0,
    "maxDelay" => 15000,
    "maxFlubs" => 100,
    "minDisplayCombo" => 5,
    "noteQualityScoreFactors" => [1,0.5,0.25,0],
    "numCountInTaps" => 3,
    "perfectModeIsOn" => false,
    "position" => 0,
    "preventFlubsIsOn" => false,
    "recordingState" => "ResumeNeeded",
    "scorePerHighestCombo" => 100.0,
    "scorePoolPerDifficulty" => [100000,125000,150000,175000,200000],
    "successPercentage" => 0.8,
    "timeAfterCountInBeforeSong" => 4000.0,
    "timeAfterCountInDuringSong" => 2500.0
  })
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

file_handler = HTTP::StaticFileHandler.new("src/assets/", directory_listing = false)

def source_origin
  "127.0.0.1:8080"
end
def source_url
  "http://127.0.0.1:8080"
end

class ProxyHandler
  include HTTP::Handler

  def initialize(@target : String)
  end

  def should_intercept_body?(request : HTTP::Request)
    request.path.ends_with?(".js") || request.path.starts_with?("/api/")
  end

  def rewrite_body(request : HTTP::Request, body : String) : String
    if request.path.ends_with?(".js")
      body = body.sub("https://bundles.jackbox.tv/", source_url + "/bundles/")
      body = body.sub("ecast.jackboxgames.com", source_origin)
      if source_url.starts_with?("http://")
        body = body.sub("scheme:\"https\"", "scheme:\"http\"")
        body = body.sub("e.scheme:this.scheme=\"wss\"", "e.scheme:this.scheme=\"ws\"")
      end
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
        json["body"].as_h["host"] = JSON::Any.new "#{source_origin}/#{json["body"]["host"]}"
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

        IO.copy(response.body_io, context.response)

        context.response.close
      end
    end
  end
end

asset_proxy_handler = ProxyHandler.new "jackbox.tv"

server = HTTP::Server.new [HTTP::ErrorHandler.new, HTTP::LogHandler.new, ws_handler, HTTP::CompressHandler.new, IndexHandler.new, file_handler, asset_proxy_handler]

address = server.bind_tcp 8080
puts "Listening on http://#{address}"
server.listen