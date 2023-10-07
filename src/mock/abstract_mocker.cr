module JuliboxTV
  # represents a "mocker" - something that's able to use a websocket connection to host a local game
  abstract class Mocker
    def initialize(@lobby : LobbyInfo)
    end

    abstract def connect(ws : WSSender, ctx : HTTP::Server::Context, game : GameInfo)
  end
end