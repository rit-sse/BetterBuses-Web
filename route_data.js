// TODO: This only needs to be run once. It might be a good idea to ensure
// this programatically.
function init() {
  // Read in JSON data.
  // TODO: Get data from schedule.json.
  var Routes = {};

  // TODO: Execute algorithm.js.
}

// Algorithm methods

function stops() {
  var stops;
  if (stops === undefined) {
    var result = [];
    _.each(Routes, function (routeData) {
      _.each(_.keys(routeData), function (stopKey) {
        if (!_.contains(result, stopKey)) {
          result.push(stopKey);
        }
      });
    });
    stops = result.sort();
  }
  return stops;
}

function routes() {
  var routes;
  if (routes === undefined) {
    var result = [];
    _.each(_.keys(Routes), function (routeKey) {
      if (!_.contains(result, routeKey)) {
        result.push(routeKey);
      }
    });
    routes = result;
    stops = result.sort();
  }
  return routes;
}

function stopsForRoute(route) {
  var result = [];
  _.each(_.keys(Routes[route]), function (stop) {
    result.push(stop);
  });
  return result.sort();
}

function routesForStop(stop) {
  var result = [];
  _.each(_.keys(Routes), function (routeKey) {
    if (Routes[routeKey][stop] !== undefined) {
      result.push(routeKey);
    }
  });
  return result.sort();
}

function stopsReachableFromStop(stop) {
  var routes = routesForStop(stop);
  var result = [];
  _.each(routes, function (route) {
    _.each(stopsForRoute(route), function (routeStop) {
      if (!_.contains(result, routeStop) && routeStop !== stop) {
        result.push(routeStop);
      }
    });
  });
  return result.sort();
}

function scheduleForRoute(route, source, destination, day) {
  return _.reduce(Routes[route][source].departures, function(result, departure) {
    var path = pathForRoute(route, source, destination, departure.time, day);
    if (path) {
      result.push(path);
    }
    return result;
  }, []);
}

function schedulesForRoutes(routes, source, destination, day) {
  var result = {};
  _.each(routes, function (route) {
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
  _.reduce(_.values(routeSchedulesFromStop(source, destination, day)), function (result, value) {
    return result.concat(value);
  }, [])
  .sort(function (obj1, obj2) {
    var t1 = timevalue(obj1[0].departs.time);
    var t2 = timevalue(obj2[0].departs.time);
    if (t1 === t2) {
      return 0;
    } else if (t1 > t2) {
      return 1;
    } else {
      return -1;
    }
  });
}

function timeSortedSchedulesFromStop(source, destination, day, time) {
  var currentTime = timevalue(time);
  return _.filter(timeSortedSchedulesFromStop(source, destination, day), function (v) {
    return timevalue(v[0].departs.time) >= currentTime;
  });
}
