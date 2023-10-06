require "uuid"
require "json"
require "../ws_sender"

module JuliboxTV
  # "mocks" how a jackbox game sends packets, for testing
  module WSMocker
    extend self

    def handler
      ws_handler = HTTP::WebSocketHandler.new do |ws, ctx|
        q = ctx.request.query_params
      
        role = q["role"]?
        raise "Role #{role} unsuppored" if role != "player"
        player_name = q["name"]?.try &.upcase || "PLAYER"
        user_id = q["user-id"]?.try { |s| UUID.new(s) } || UUID.random
        format = q["format"]?
        raise "Format #{format} unsuppored" if format != "json"
        
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
    end
  end
end