# like crystal's INI, except with the comments stored
module JuliboxTV::CommentedINI
  # value, comment
  alias Value = Tuple(String, String?)

  # Exception thrown on an INI parse error.
  class ParseException < Exception
    getter line_number : Int32
    getter column_number : Int32

    def initialize(message, @line_number, @column_number)
      super "#{message} at line #{@line_number}, column #{@column_number}"
    end

    def location
      {line_number, column_number}
    end
  end

  # Parses INI-style configuration from the given string.
  # Raises a `ParseException` on any errors.
  #
  # ```
  # require "ini"
  #
  # INI.parse("[foo]\na = 1") # => {"foo" => {"a" => "1"}}
  # ```
  def self.parse(string_or_io : String | IO) : Hash(String, Hash(String, Value))
    ini = Hash(String, Hash(String, Value)).new
    current_section = ini[""] = Hash(String, Value).new
    lineno = 0
    comments = [] of String

    string_or_io.each_line do |line|
      lineno += 1
      next if line.empty?

      offset = 0
      line.each_char do |char|
        break unless char.ascii_whitespace?
        offset += 1
      end

      case line[offset]
      when '#', ';'
        comments << line.lstrip("#;").strip
      when '['
        end_idx = line.index(']', offset)
        raise ParseException.new("Unterminated section", lineno, line.size) unless end_idx
        raise ParseException.new("Data after section", lineno, end_idx + 1) unless end_idx == line.size - 1

        current_section_name = line[offset + 1...end_idx]
        current_section = ini[current_section_name] ||= Hash(String, Value).new
        comments = [] of String
      else
        key, eq, value = line.partition('=')
        raise ParseException.new("Expected declaration", lineno, key.size) if eq != "="

        current_section[key.strip] = {value.strip, comments.join("\n")}
      end
    end

    ini.delete("") if ini[""].empty?
    ini
  end

  # Generates an INI-style configuration from a given hash.
  #
  # ```
  # require "ini"
  #
  # INI.build({"foo" => {"a" => "1"}}, true) # => "[foo]\na = 1\n\n"
  # ```
  def self.build(ini, space : Bool = false) : String
    String.build { |str| build str, ini, space }
  end

  # Appends INI data to the given IO.
  def self.build(io : IO, ini, space : Bool = false) : Nil
    # An empty section has to be at first, to prevent being included in another one.
    ini[""]?.try &.each do |key, value|
      value[1].try &.each_line do |comment|
        io << (space ? "# " : "#") << comment << '\n'
      end
      io << key << (space ? " = " : '=') << value[0] << '\n'
    end
    ini.each do |section, contents|
      next if section.to_s.empty?
      io << '[' << section << "]\n"
      contents.each do |key, value|
        value[1].try &.each_line do |comment|
          io << (space ? "# " : "#") << comment << '\n'
        end
        io << key << (space ? " = " : '=') << value[0] << '\n'
      end
      io.puts
    end
    io.flush
  end
end