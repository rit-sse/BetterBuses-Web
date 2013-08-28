#! /usr/bin/env ruby

@departure_times = {}
@arrival_times = {}

class String
    def strip_prefix(prefix)
        if self.start_with? prefix then
            return self[prefix.length..-1]
        else
            return self
        end
    end
end

class Array
    def to_s()
        result = "[ "
        index = 0
        self.each { |value|
            if value.is_a? String then
                result += "\"#{value}\""
            else
                result += "#{value}"
            end
            index += 1
            result += ", " if self.length != index - 1
        }
        result += " ]"
    end

end

class Hash
    def to_s()
        result = "{ "
        index = 0
        self.each { |key, value|
            result += "\"#{key}\" : "
            if value.is_a? String then
                result += "\"#{value}\""
            else
                result += "#{value}"
            end
            index += 1
            result += ", " if self.size != index - 1
        }
        result += " }"
    end
end

@current_route = ""
@current_days = ""
@stops = []

def record(dictionary, time, from, to)
    if from == nil then from == "" end
    if to == nil then to == "" end
    dictionary[from] = {} if dictionary[from] == nil
    dictionary[from][to] = [] if dictionary[from][to] == nil
    dictionary[from][to] << {:time => time, :route => "#{@current_route}", :days => "#{@current_days}"}
end

def extract_times(string)
    def contains_special_stop?(time)
        time.include? "-"
    end
    def special_stop(time)
        parts = time.split("-", 2)
        if parts.length == 2 then
            return {:time => parts[1].strip, :stop => parts[0].strip}
        else
            return nil
        end
    end
    times = string.split(">")
    current_stops_index = 0
    previous_stop = nil
    previous_time = nil
    times.each { |command|
        command = command.strip
        if command != "" then
            time = ""
            stop = ""
            if contains_special_stop? command then
                parts = special_stop command
                time = parts[:time]
                stop = parts[:stop]
            else
                time = command
                stop = @stops[current_stops_index]
                current_stops_index += 1
            end
            if previous_stop != nil and previous_time != nil then
                record(@departure_times, previous_time, previous_stop, stop)
                record(@arrival_times, time, previous_stop, stop)
            end
            previous_time = time
            previous_stop = stop
        else
            current_stops_index += 1
        end
        if current_stops_index == @stops.length then
            current_stops_index = 0
        end
    }
end

def figure_out_route(string)
    stops = string.split ">"
    @stops = []
    stops.each { |stop|
        @stops << stop.strip
    }
end

def print_data()
    puts "{ \"departures\" : #{@departure_times}, \"arrivals\" : #{@arrival_times} }"
end

def read_input(string)
    raw_input = string.strip
    if string.start_with? ":set" then
        input = raw_input.strip_prefix(":set").strip
        if input.start_with? "route" then
            parts = input.strip_prefix("route").strip.split(":", 2)
            if (parts.length == 1) then
                @current_route = parts[0].strip
            elsif
                @current_route = parts[0].strip
                figure_out_route(parts[1].strip)
            end
        elsif input.start_with? "days" then
            @current_days = input.strip_prefix("days").strip
        elsif input.start_with? "stops" then
            figure_out_route(input.strip_prefix("stops").strip)
        end
    elsif string.start_with? ":q" then
        print_data()
        exit
    elsif string.start_with? "#" then
        #this represents a comment and the line is ignored
    else
        extract_times(raw_input)
    end
end

while true do
    read_input(gets)
end
