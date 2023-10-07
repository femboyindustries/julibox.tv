require "http/web_socket"

module JuliboxTV
  # light abstraction over websockets
  class WSSender
    @pc = 1
    @versions = {} of String => Int32
    
    def initialize(@ws : HTTP::WebSocket)
      @ws.on_message do |msg|
        # example:
        # {"seq":1,"opcode":"object/update","params":{"key":"instrumentSelect:2","val":{"selectInstrument":{"beatmapSlug":"signature","instrumentSlug":"tutorial"}}}}
        json = JSON.parse(msg)
        @on_message.try &.call(json["opcode"].as_s, json["params"]["key"].as_s, json["params"]["val"])
      end
    end

    def on_message(&@on_message : String, String, JSON::Any ->)
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

    def close
      @ws.close
    end
  end
end