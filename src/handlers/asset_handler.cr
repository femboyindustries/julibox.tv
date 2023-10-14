require "http"
require "http/server/handler"

module JuliboxTV
  class AssetHandler
    include HTTP::Handler

    def initialize(@mods : Array(Mod), @disable_cache : Bool = false)
    end

    def call(context : HTTP::Server::Context)
      @mods.each do |mod|
        mod.assets.each do |asset|
          if asset.enabled && context.request.path == asset.path
            asset.asset_io do |io|
              IO.copy(io, context.response)
            end
            return
          end
        end
      end

      call_next(context)
    end
  end
end