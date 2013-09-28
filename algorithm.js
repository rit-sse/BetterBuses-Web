"use strict";

// the routes JSON object
Routes = {};

function contains(array, object) {
  return array.indexOf(object) !== -1;
}

function timevalue(t) {
    var ten_hour = 0,
        one_hour = 0,
        ten_min = 0,
        one_min = 0,
        raw_time;
    switch (t.length) {
    case 4:
        one_hour = parseInt(t[0], 10);
        ten_min = parseInt(t[2], 10);
        one_min = parseInt(t[3], 10);
        break;
    case 5:
        if (t[4] === "P" || t[4] === "p" || t[4] === "A" || t[4] === "a") {
            one_hour = parseInt(t[0], 10);
            if (t[4] === "P" || t[4] === "p") {
                one_hour += 12;
            }
            ten_min = parseInt(t[2], 10);
            one_min = parseInt(t[3], 10);
        } else {
            ten_hour = parseInt(t[0], 10);
            one_hour = parseInt(t[1], 10);
            if (ten_hour === 1 && one_hour === 2) {
                ten_hour = 0;
                one_hour = 0;
            }
            ten_min = parseInt(t[3], 10);
            one_min = parseInt(t[4], 10);
        }
        break;
    case 6:
        ten_hour = parseInt(t[0], 10);
        one_hour = parseInt(t[1], 10);
        if (t[5] === "P" || t[5] === "p") {
            if (!(ten_hour === 1 && one_hour === 2)) {
                one_hour += 12;
            }
        }
        ten_min = parseInt(t[3], 10);
        one_min = parseInt(t[4], 10);
        break;
    }
    function post_midnight_time_value(t_val) {
        var result = t_val,
            str_val = String(t_val);
        if (str_val.length === 3) {
            if (parseInt(str_val[0], 10) < 5) {
                result = parseInt(str_val, 10) + 2400;
            }
        }
        return result;
    }
    raw_time = (ten_hour * 1000) + (one_hour * 100) + (ten_min * 10) + one_min;
    return post_midnight_time_value(raw_time);
}

// return an array of stops that contain all the stops listed in the given array
// [stop string] -> [route string]
function findRouteWithStops(stops_list) {
    var acceptable_routes = Object.keys(Routes).filter(function (route) {
        var correlating_stops = Object.keys(route).filter(function (route_stop) {
            return contains(stops_list, route_stop);
        });
        if (correlating_stops.length === stops_list.length) {
            return true;
        }
        return false;
    });
    return acceptable_routes;
}

// route name -> (arrivals | departures) -> stop name -> time -> {stop, time, days}
function __firstInRouteFromStopAtOrAfterTime(route_name, stop_type, source_stop_name, time) {
    return Object.keys(Routes[route_name]).reduce(function (result, route_stop) {
        var from_stop = function (stop_struct) {
            return (stop_type === "departures") ? route_stop : stop_struct.from;
        };
        return route_stop[stop_type].reduce(function (result, stop_struct) {
            var resulting = result;
            if (from_stop(stop_struct) === source_stop_name) {
                if (timevalue(stop_struct.time) >= timevalue(time)) {
                    if (resulting !== null) {
                        if (timevalue(stop_struct.time) < timevalue(result.time)) {
                            resulting = stop_struct;
                        }
                    } else {
                        resulting = stop_struct;
                    }


                }
            }
            return resulting;
        }, result);
    }, null);
}

// route name -> stop name -> time -> {from, time, days}
function firstStopInRouteArrivingFromStopAfterTime(route_name, stop_name, time) {
    // TODO: Make sure it's not the same time.
    return __firstInRouteFromStopAtOrAfterTime(route_name, "arrivals", stop_name, time);
}

// route name -> stop name -> time -> {to, time, days}
function firstTimeInRouteDepartingFromStopAtOrAfterTime(route_name, stop_name, time) {
    return __firstInRouteFromStopAtOrAfterTime(route_name, "departures", stop_name, time);
}

// route name -> source stop name -> dest stop name -> time -> [{"departs" : departure structure, "arrives" : arrival structure}]
function routeScheduleForTime(route_name, from_stop, to_stop, start_time) {
    var result = [],
        current_time = start_time,
        current_stop = from_stop,
        departure_struct,
        arrival_struct;
    while (true) {
        // get departure data
        departure_struct = firstTimeInRouteDepartingFromStopAtOrAfterTime(route_name, current_stop, current_time);
        if (departure_struct === null) {
            return null;
        }
        current_time = departure_struct.time;
        // get arrival data
        arrival_struct = firstStopInRouteArrivingFromStopAfterTime(route_name, current_stop, current_time);
        if (arrival_struct === null) {
            return null;
        }
        current_time = arrival_struct.time;
        current_stop = departure_struct.to;
        result.push({"departure" : departure_struct, "arrival" : arrival_struct});
        if (current_stop === to_stop) {
            return result;
        }
    }
}

// [route name] -> source stop name -> destination stop name -> {route name : [[{"departs" : departure structure, "arrives" : arrival structure}]]}
function findScheduleFromRoutes(routes_list, from_stop, to_stop) {
    return routes_list.reduce(function (resulting, route_name) {
        var departures_list = Routes[route_name][from_stop].departures,
            schedules = departures_list.reduce(function (schedules, departure) {
                var routeSchedule = routeScheduleForTime(route_name, from_stop, to_stop, departure.time);
                if (routeSchedule !== null) {
                    schedules.push(routeSchedule);
                }
                return schedules;
            }, []);
        if (schedules.length !== 0) {
            resulting[route_name] = schedules;
        }
        return resulting;
    }, {});
}
"use strict";

// TODO: Consider moving this stuff into a RouteData module.

// Read in JSON data.
// TODO: Get data from schedule.json.
var Routes = {};

// TODO: Execute algorithm.js.

var RouteData = {
  "stops": [],
  "routes": []
};

// Utility methods

// Works just like the spaceship operator (<=>) in Ruby.
function compare(a, b) {
  if (typeof a === 'string') {
    return a.localeCompare(b);
  }

  var result;

  if (a < b) {
    result = -1;
  } else if (a > b) {
    result = 1;
  }
  else {
    result = 0;
  }

  return result;
}

function contains(array, object) {
  return array.indexOf(object) !== -1;
}

function values(object) {
  return Object.keys(object).map(function (key) {
    return object[key];
  });
}

// Algorithm methods

function stops() {
  var _stops, result;
  if (_stops === undefined) {
    result = [];
    Routes.forEach(function (routeData) {
      Object.keys(routeData).forEach(function (stopKey) {
        if (!contains(result, stopKey)) {
          result.push(stopKey);
        }
      });
    });
    RouteData.stops = result.sort();
  }
  return _stops;
}

function routes() {
  var _routes, result;
  if (_routes === undefined) {
    result = [];
    Object.keys(Routes).forEach(function (routeKey) {
      if (!contains(result, routeKey)) {
        result.push(routeKey);
      }
    });
    RouteData.routes = result;
    RouteData.stops = result.sort();
  }
  return _routes;
}

function stopsForRoute(route) {
  var result = [];
  Object.keys(Routes[route]).forEach(function (stop) {
    result.push(stop);
  });
  return result.sort();
}

function routesForStop(stop) {
  var result = [];
  Object.keys(Routes).forEach(function (routeKey) {
    if (Routes[routeKey][stop] !== undefined) {
      result.push(routeKey);
    }
  });
  return result.sort();
}

function stopsReachableFromStop(stop) {
  var routes = routesForStop(stop),
      result = [];
  routes.forEach(function (route) {
    stopsForRoute(route).forEach(function (routeStop) {
      if (!contains(result, routeStop) && routeStop !== stop) {
        result.push(routeStop);
      }
    });
  });
  return result.sort();
}

function scheduleForRoute(route, source, destination, day) {
  return Routes[route][source].departures.reduce(function(result, departure) {
    var path = pathForRoute(route, source, destination, departure.time, day);
    if (path) {
      result.push(path);
    }
    return result;
  }, []);
}

function schedulesForRoutes(routes, source, destination, day) {
  var result = {};
  routes.forEach(function (route) {
    var schedule = scheduleForRoute(route, source, destination, day);
    if (schedule.size !== 0) {
      result[route] = schedule;
    }
  });
  return result;
}

function routeSchedulesFromStop(source, desination, day) {
  return schedulesForRoutes(routesForStop(source), source, destination, day);
}

function timeSortedSchedulesFromStop(source, destination, day) {
  values(routeSchedulesFromStop(source, destination, day)).reduce(function (result, value) {
    return result.concat(value);
  }, [])
  .sort(function (obj1, obj2) {
    var t1 = timevalue(obj1[0].departs.time),
        t2 = timevalue(obj2[0].departs.time);
    return compare(t1, t2);
  });
}

function timeSortedSchedulesFromStop(source, destination, day, time) {
  var currentTime = timevalue(time);
  return timeSortedSchedulesFromStop(source, destination, day).filter(function (v) {
    return timevalue(v[0].departs.time) >= currentTime;
  });
}

// Basic javascript interaction interfaces

function firstDepartureInRoute(route, source, time, day) {
  var targetTime = timevalue(time);
  return Routes[route][source].departures.reduce(function(result, departure) {
    var currentTime = timevalue(departure.time);
    if (currentTime >= targetTime && contains(departure.days, day)) {
      if (result) {
        if (timevalue(result.time) <= currentTime) {
          return result;
        }
      }
      return departure;
    }
    return result;
  }, null);
}

function firstArrivalFromStop(source, route, destination, time, day) {
  var targetTime = timevalue(time);
  return Routes[route][destination].arrivals.reduce(function(result, arrival) {
    var currentTime = timevalue(arrival.time);
    if (currentTime > targetTime && (arrival.from === source) && contains(arrival.days, day)) {
      if (result) {
        if (currentTime >= timevalue(result.time)) {
          return result;
        }
      }
      return arrival;
    }
    return result;
  }, null);
}

function pathForRoute(route, source, destination, time, day) {
    var result = [],
        currentStop = source,
        currentTime = time,
        arrival;
    while (true) {
        departure = firstDepartureInRoute(route, currentStop, currentTime, day);
        if (!departure) {
            result = null;
            return null;
        }
        if (source === departure.to) {
            result = null;
            return null;
        }
        currentTime = departure.time;
        arrival = firstArrivalFromStop(currentStop, route, departure.to, currentTime, day);
        if (!arrival) {
            result = null;
            return null;
        }
        currentTime = arrival.time;
        currentStop = departure.to;
        result.push({"departs": departure, "arrives": arrival, "route": route});
        if (currentStop === destination) {
            return result;
        }
    }
}
