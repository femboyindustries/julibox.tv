require "uuid"
require "json"
require "../ws_sender"

module JuliboxTV
  record LobbyInfo,
    code : String
  record GameInfo,
    lobby : LobbyInfo, role : String, player_name : String, user_id : UUID, format : String

  # "mocks" how a jackbox game sends packets, for testing
  class WSMockHandler
    def initialize(@mocker : Mocker)
    end

    def handler
      HTTP::WebSocketHandler.new do |ws, ctx|
        q = ctx.request.query_params
      
        role = q["role"]? || "nil"
        raise "Role #{role} unsuppored" if role != "player"
        player_name = q["name"]?.try &.upcase || "PLAYER"
        user_id = q["user-id"]?.try { |s| UUID.new(s) } || UUID.random
        format = q["format"]? || "json"
        raise "Format #{format} unsuppored" if format != "json"
        
        ws_sender = WSSender.new ws
        lobby = LobbyInfo.new(ctx.request.path.split("/")[-2])
        game = GameInfo.new(lobby, role, player_name, user_id, format)

        LOG.info { "Player #{game.player_name} joined game #{lobby.code} as #{role}" }

        @mocker.connect(ws_sender, ctx, game)
      end
    end
  end
end