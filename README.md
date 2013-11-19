#Better Buses

[![Code Climate](https://codeclimate.com/github/rit-sse/BetterBuses-Web.png)](https://codeclimate.com/github/rit-sse/BetterBuses-Web)

A better bus schedule for RIT for a more enlightened time.

##About

Bus schedules can be hard and convoluted to read. When you want to get from
point A to point B, you are required to inherently know which bus route that
applies to, and you're supposed to inherently know what all the little symbols
mean, and if you don't understand, you need to hunt down the key and are forced
to figure it out.

Computers today can do all the hard work for you, leaving you with the right
information needed to get from point A to point B at any time you wish.

Better buses is aimed to convert RIT's bus schedules first into a
computer-friendly format, so that they may present the information to humans
in a friendly manner.

##Bus Schedule Input Notation

The bus schedules are input in a `.schedule` file that adheres to the following
syntax definitions.

- Commands are on a line-by-line basis. Commands end with a new-line.
- Comments are any line that begin with a `#` character. There are no
  multi-line comments.
- Commands can input data or set the variables for data.
    - `:set` commands
        - `:set days` is followed by the days that the input data will apply to
        - `:set stops` is followed by the stops for the current route in order they
          are visited. The stops are visited in a cicular maner for input data, and
          individual stops are delinated by the `>` character.
        - `:set route` is followed by the name of the route for input data. If a
          `:` character follows the route name, the route will be followed by the
          stops for the route (this is a kind of short-hand/syntatic-sugar).
    - The `:q` command will print the resulting JSON representation of the bus
      schedule and quit the program.
    - All other commands are data input for times. Delineated by `>` characters,
      bus stop times are in order of the stops and will loop around the stops
      in circles.
        - If a stop time is in the format `STOP_NAME - TIME`, it represents a
          special case stop inserted between the two normally occuring stops.
        - If a stop is to be skipped, place nothing between the `>` characters.

The following is an example of a `.schedule` file.

    # Imaginary Bus Schedule
    :set route Candy Land Route
    :set stops Gumdrop Forrest > Chocolate River > Candy Mountain
    :set days Monday,Tuesday,Wednesday,Thursday,Friday
    # these times depart from the Gumdrop Forest, go to the Chocolate River,
    # arrive at Candy Mountain, and then return to the Gumdrop Forest
    9:00 > 9:20 > 9:30 > 9:50
    :set days Saturday,Sunday,Holiday
    # these times depart from the Gumdrop Forest, make a special stop at the Caremel Lake,
    # go to the Chocolate River, arrive at Candy Mountain, and then return to the Gumdrop Forest
    10:00 > Caremel Lake - 10:10 > 10:20 > 10:30 > 10:50
    :set route McDonalds World : Burgers > Fries > Salads
    :set days All
    11:00 > 11:10 > 11:20 > 11:30 > 11:40 > 11:50 > 12:00P
