require "http/web_socket"

ws_handler = HTTP::WebSocketHandler.new do |ws, ctx|
  # wss://i-08ed2a462549e47c0.play.jackboxgames.com/api/v2/rooms/WYJX/play?role=player&name=GIRLTHING&format=json&user-id=aaac9766-7291-4d0e-bca5-f9e253bf7489
  # TODO
  proxy = HTTP::WebSocket.new("websocket.example.com", "/chat", tls: true)

  ws.on_ping { proxy.ping }
  ws.on_message { |msg| proxy.send(msg) }
  ws.on_close { |close_code, msg| proxy.close(close_code, msg) }
  
  proxy.on_pong { ws.pong }
  proxy.on_message { |msg| ws.send(msg) }
  proxy.on_close { |close_code, msg| ws.close(close_code, msg) }
end

server = HTTP::Server.new [ws_handler]

