require "./mocker.cr"

module JuliboxTV
  class NopusOpusMocker < Mocker
    def initialize(@lobby : LobbyInfo)
      initialize(@lobby, File.read("src/assets/chart.json"))
    end
    def initialize(@lobby : LobbyInfo, chart_json : String)
      @chart = JSON.parse(chart_json)
      # todo
      @beatmap = @chart["beatmaps"][0]
    end

    def connect(ws : WSSender, ctx : HTTP::Server::Context, player : PlayerInfo)
      ws.send("client/welcome", JSON.parse(
        File.read("src/assets/lobby-sample.json")
          # this isn't the worst way to do this! but it _is_ close
          .sub("<PLAYER>", player.player_name)
          # exclusively relevant to reconnections
          .sub("<SECRET>", UUID.random)
          # idk what this is based on
          .sub("<DEVICEID>", "0366929ab8.8773612ac287d0d5de4a2a")
      ))
    
      # todo: is sending both necessary?
      ws.send("object", "connectedPlayers", {"2" => {"avatar" => 0, "id" => 2, "inSong" => false, "name" => player.player_name}})
      ws.send("object", "connectedPlayers", {"2" => {"avatar" => 0, "beatmapSlug" => @beatmap["slug"], "id" => 2, "inSong" => false, "instrumentSlug" => @chart["slug"], "name" => player.player_name}})
    
      ws.send("object", "beatmap:#{@beatmap["slug"]}", {
        "config" => @beatmap,
        "scaleKey" => @chart["scaleKey"],
        "scaleType" => @chart["scaleType"],
        "songName" => "Tutorial" # todo: how?
      })
      ws.send("object", "instrument:#{@chart["slug"]}", {
        "config" => {
          "capabilities" => ["Melodic", "Sustain"], # ???
          "chains" => [
            # todo: keysounds?
          ] of Nil,
          "slug" => @chart["slug"]
        },
        "name" => "Tutorial Sampler" # ???
      })
      ws.send("object", "guide", {
        "guide" => @chart["guide"]
      })
    
      ws.send("object", "recording:2", {} of Nil => Nil)
      ws.send("object", "player:2", {
        "guide" => {"$ref" => "guide"},
        "kind" => "recording",
        "recordingInfo" => {"$ref" => "recordingInfo"},
        "responseEntity" => "recording:2"
      })
    
      ws.send("object", "recordingInfo", {
        "continuousCriteriaFactors" => [1,0.5,0.25,0],
        "continuousPercentageCriteria" => [60,45,30],
        "continuousSignalCriteria" => [0.03,0.08,0.12],
        "countInIndex" => 1,
        "discreteCriteria" => [80,120,160],
        "duration" => @chart["duration"],
        "guideStartOffset" => @chart["guideStartOffset"],
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