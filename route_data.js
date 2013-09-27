"use strict";

// TODO: Consider moving this stuff into a RouteData module.

// Read in JSON data.
// TODO: Get data from schedule.json.
var Routes = {};

// TODO: Execute algorithm.js.

var _stops = [];
var _routes = [];

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
  var stops, result;
  if (stops === undefined) {
    result = [];
    Routes.forEach(function (routeData) {
      Object.keys(routeData).forEach(function (stopKey) {
        if (!contains(result, stopKey)) {
          result.push(stopKey);
        }
      });
    });
    _stops = result.sort();
  }
  return stops;
}

function routes() {
  var routes, result;
  if (routes === undefined) {
    result = [];
    Object.keys(Routes).forEach(function (routeKey) {
      if (!contains(result, routeKey)) {
        result.push(routeKey);
      }
    });
    _routes = result;
    _stops = result.sort();
  }
  return routes;
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
