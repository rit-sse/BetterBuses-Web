"use strict";

// the routes JSON object
Routes = {};

function contains(array, object) {
  return array.indexOf(object) !== -1;
}

function keyfilter(map, fun) {
    var resulting = [],
        key;
    for (key in map) {
        if (map.hasOwnProperty(key)) {
            if (fun(key)) {
                resulting.push(key);
            }
        }
    }
    return resulting;
}

function keyfoldl(map, default_val, fun) {
    var resulting = default_val,
        key;
    for (key in map) {
        if (map.hasOwnProperty(key)) {
            resulting = fun(resulting, key);
        }
    }
    return resulting;
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
    var acceptable_routes = keyfilter(Routes, function (route) {
        var correlating_stops = keyfilter(route,  function (route_stop) {
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
    return keyfoldl(Routes[route_name], null, function (result, route_stop) {
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
    });
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
