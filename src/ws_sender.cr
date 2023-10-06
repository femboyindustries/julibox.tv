require "http/web_socket"

module JuliboxTV
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
end