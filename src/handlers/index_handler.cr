require "http/server/handler"

module JuliboxTV
  # internally redirects / to /index.html
  class IndexHandler
    include HTTP::Handler

    def call(context)
      if context.request.path == "/"
        context.request.path = "/index.html"
      end
      call_next(context)
    end
  end
end