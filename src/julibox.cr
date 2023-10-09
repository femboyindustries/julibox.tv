require "./cli.cr"

module JuliboxTV
  extend self

  def trunc(str : String, max_size = 200)
    str = str.strip
    max_size = Math.min(max_size, (str.index('\n') || (max_size + 1)) - 1)
    str[0..max_size] + (str.size > max_size ? "..." : "")
  end

  VERSION = "0.1.0"
  LOG = ::Log.for("julibox")
end

JuliboxTV.run