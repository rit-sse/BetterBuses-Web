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

function keyfilter(map, fun) {
	var resulting = new Array();
	for (key in map) {
		if (fun(key)) {
			resulting.push(key);
		}
	}
	return resulting;
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

// [route string] -> from stop -> to stop -> {route string : [{"departs" : time string, "arrives" : time string, "route" : [stop string], "days" : day string}]}
function findScheduleFromRoutes(routes_list, from_stop, to_stop) {
	// {from: _, to:_, between:[{stop:_, time:_}]}
	return listfoldl(routes_list, {}, function(schedule, routename){
		schedule[routename] = []; // TODO: have an ordered list of all the stops between the two stops 
	});
}
