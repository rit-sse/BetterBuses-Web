// the routes JSON object
Routes = {};

function listcontains(list, item) {
	for (var i=0; i<list.length; i++) {
		if (list[i] == item) {
			return true;
		}
	}
	return false;
}

function listfoldl(list, default_val, fun) {
	var resulting = default_val;
	for (var i=0; i < list.length; i++) {
		resulting = fun(result, list[i]);
	}
	return resulting;
}

function listfilter(list, fun) {
	var resulting = new Array();
	for (var i=0; i < list.length; i++) {
		if (fun(list[i])) {
			resulting.push(list[i]);
		}
	}
	return resulting;
}

function listmap(list, fun) {
	var resulting = new Array();
	for (var i=0; i<list.length; i++) {
		resulting.push(fun(list[i]));
	}
	return resulting;
}

function keyfilter(map, fun) {
	var resulting = new Array();
	for (key in map) {
		if (fun(key)) {
			resulting.push(key);
		}
	}
	return resulting;
}

function keyfoldl(map, default_val, fun) {
	var resulting = default_val;
	for (key in map) {
		resulting = fun(resulting, key);
	}
	return resulting;
}

function timevalue(t1, t2) {
	var ten_hour = 0;
	var one_hour = 0;
	var ten_min = 0;
	var one_min = 0;
	switch (t.length) {
		case 4:
			one_hour = parseInt(t[0]);
			ten_min = parseInt(t[2]);
			one_min = parseInt(t[3]);
			break;
		case 5:
			if (t[4] == "P" && t[4] == "p") {
				one_hour = parseInt(t[0]);
				one_hour += 12;
				ten_min = parseInt(t[2]);
				one_min = parseInt(t[3]);
			} else {
				ten_hour = parseInt(t[0]);
				one_hour = parseInt(t[1]);
				if (ten_hour == 1 && one_hour == 2) {
					ten_hour = 0;
					one_hour = 0;
				}
				ten_min = parseInt(t[3]);
				one_min = parseInt(t[4]);
			}
			break;
		case 6:
			ten_hour = parseInt(t[0]);
			one_hour = parseInt(t[1]);
			one_hour += 12;
			ten_min = parseInt(t[3]);
			one_min = parseInt(t[4]);
			break;
	}
	function post_midnight_time_value(t_val) {
		var result = t_val;
		var str_val = "" + t_val;
		if (str_val.length == 3) {
			if (parseInt(str_val[0]) < 5) {
				result = parseInt(str_val) + 2400;
			}
		}
		return result;
	}
	var raw_time = (ten_hour * 1000) + (one_hour * 100) + (ten_min * 10) + one_min;
	return post_midnight_time_value(raw_time);
}

// return an array of stops that contain all the stops listed in the given array
// [stop string] -> [route string]
function findRouteWithStops(stops_list) {
	var acceptable_routes = keyfilter(Routes, function(route){
		var correlating_stops = keyfilter(route, function(route_stop){
			return listcontains(stops_list, route_stop);
		});
		if (correlating_stops.length == stops_list.length) {
			return true;
		}
		return false;
	});
	return acceptable_routes;
}

// route name -> (arrivals | departures) -> stop name -> time -> {stop, time, days}
function __firstInRouteFromStopAtOrAfterTime(route_name, stop_type, source_stop_name, time) {
	return keyfoldl(Route[route_name], null, function(result, route_stop){
		var from_stop = function(stop_struct) {
			if (stop_type == "departures") {
				return route_stop;
			} else {
				return stop_struct.from;
			}
		};
		return listfoldl(route_stop[stop_type], result, function(result, stop_struct){
			var resulting = result;
			if (from_stop(stop_struct) === source_stop_name) {
				if (timevalue(stop_struct.time) >= timevalue(time)) {
					if (resulting != null) {
						if (timevalue(stop_struct.time) < timevalue(result.time)) {
							resulting = stop_struct;
						}
					} else {
						resulting = stop_struct;
					}

					
				}
			}
			return resulting;
		});
	});
}

// route name -> stop name -> time -> {from, time, days}
function firstStopInRouteArrivingFromStopAfterTime(route_name, source_stop_name, time) {
	return __firstInRouteFromStopAfterTime(route_name, "arrivals", source_stop_name, time);
}

// route name -> stop name -> time -> {to, time, days}
function firstTimeInRouteDepartingFromStopAtOrAfterTime(route_name, stop_name, time) {
	return __firstInRouteFromStopAtOrAfterTime(route_name, "departures", source_stop_name, time);
}

// route name -> source stop name -> dest stop name -> time -> [{"departs" : departure structure, "arrives" : arrival structure}]
function routeScheduleForTime(route_name, from_stop, to_stop, start_time) {
	var result = new Array();
	var current_time = start_time;
	var current_stop = from_stop;
	while (true) {
		// get departure data
		var departure_struct = firstTimeInRouteDepartingFromStopAtOrAfterTime(route_name, current_stop, current_time);
		if (departure_struct == null) {
			return null;
		}
		current_time = departure_struct.time;
		// get arrival data
		var arrival_struct = firstStopInRouteArrivingFromStopAfterTime(route_name, current_stop, current_time);
		if (arrival_struct == null) {
			return null;
		}
		current_time = arrival_struct.time;
		current_stop = departure_struct.to;
		result.push({"departure" : departure_struct, "arrival" : arrival_struct});
		if (current_stop == to_stop) {
			return result;
		}
	}
}

// [route name] -> source stop name -> destination stop name -> {route name : [[{"departs" : departure structure, "arrives" : arrival structure}]]}
function findScheduleFromRoutes(routes_list, from_stop, to_stop) {
	return listfoldl(routes_list, {}, function(resulting, route_name){
		var departures_list = Routes[route_name][from_stop].departures;
		var schedules = listfoldl(departures_list, [], function(schedules, departure){
			var routeSchedule = routeScheduleForTime(route_name, from_stop, to_stop, depatrure.time);
			if (routeSchedule != null) {
				schedules.push(routeSchedule);
			}
			return schedules;
		});
		if (schedules.length != 0) {
			resulting[route_name] = schedules;
		}
		return resulting;
	});
}
