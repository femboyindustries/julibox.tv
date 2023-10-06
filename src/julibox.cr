require "./cli.cr"

module JuliboxTV
  extend self

  VERSION = "0.1.0"
  LOG = ::Log.for("julibox")
end

JuliboxTV.run