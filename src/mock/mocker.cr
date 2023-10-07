module JuliboxTV
  # represents a "mocker" - something that's able to use a websocket connection to host a local game
  abstract class Mocker
    def initialize(@lobby : LobbyInfo)
    end

    abstract def connect(ws : WSSender, ctx : HTTP::Server::Context, player : PlayerInfo)
    def disconnect(ctx : HTTP::Server::Context, player : PlayerInfo)
    end
    def message(opcode : String, key : String, val)
    end
  end
end