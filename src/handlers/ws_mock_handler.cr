require "uuid"
require "json"
require "../ws_sender"

module JuliboxTV
  record LobbyInfo,
    code : String
  record PlayerInfo,
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
        player = PlayerInfo.new(lobby, role, player_name, user_id, format)

        LOG.info { "#{player.player_name} joined game #{lobby.code} as #{role}" }

        ws.on_close do |code, reason|
          LOG.info { "#{player.player_name} left game #{lobby.code} (#{code}, reason: #{(reason != "" && reason) || "<none>"})" }
          @mocker.disconnect(ctx, player)
        end

        ws_sender.on_message do |opcode, key, val|
          LOG.debug { "#{player.player_name}: #{opcode.to_s.colorize(:cyan)} #{key}" }
          @mocker.message(opcode, key, val)
        end

        @mocker.connect(ws_sender, ctx, player)
      end
    end
  end
end