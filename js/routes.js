var Schedule = {

    // Read in JSON data.
    data: {},

    // Algorithm methods

    stops: function () {
        var result = [];
        Object.keys(Schedule.data).forEach(function (key) {
            var routeData = Schedule.data[key];
            Object.keys(routeData).forEach(function (stopKey) {
                if (!Utilities.contains(result, stopKey)) {
                    result.push(stopKey);
                }
            });
        });
        return result.sort();
    },

    routes: function () {
        var result = [];
        Object.keys(Schedule.data).forEach(function (routeKey) {
            if (!Utilities.contains(result, routeKey)) {
                result.push(routeKey);
            }
        });
        return result;
    },

    stopsForRoute: function (route) {
        var result = [];
        Object.keys(Schedule.data[route]).forEach(function (stop) {
            result.push(stop);
        });
        return result.sort();
    },

    routesForStop: function (stop) {
        var result = [];
        Object.keys(Schedule.data).forEach(function (routeKey) {
            if (Schedule.data[routeKey][stop] !== undefined) {
                result.push(routeKey);
            }
        });
        return result.sort();
    },

    stopsReachableFromStop: function (stop) {
        var routes = Schedule.routesForStop(stop),
            result = [];
        routes.forEach(function (route) {
            Schedule.stopsForRoute(route).forEach(function (routeStop) {
                if (!Utilities.contains(result, routeStop) && routeStop !== stop) {
                    result.push(routeStop);
                }
            });
        });
        return result.sort();
    },

    scheduleForRoute: function (route, source, destination, day) {
        try {
            return Schedule.data[route][source].departures.reduce(function (result, departure) {
                var path = Schedule.pathForRoute(route, source, destination, departure.time, day);
                if (path) {
                    result.push(path);
                }
                return result;
            }, []);
        } catch (e) {
            return [];
        }
    },

    schedulesForRoutes: function (routes, source, destination, day) {
        var result = {};
        routes.forEach(function (route) {
            var schedule = Schedule.scheduleForRoute(route, source, destination, day);
            if (schedule.size !== 0) {
                result[route] = schedule;
            }
        });
        return result;
    },

    routeSchedulesFromStop: function (source, destination, day) {
        return Schedule.schedulesForRoutes(Schedule.routesForStop(source), source, destination, day);
    },

    timeSortedSchedulesFromStop: function (source, destination, day, time) {
        var result, currentTime;
        if (time === undefined) {
            result = Utilities.values(Schedule.routeSchedulesFromStop(source, destination, day)).reduce(function (result, value) {
                return result.concat(value);
            }, [])
                .sort(function (obj1, obj2) {
                    var t1 = Utilities.timevalue(obj1[0].departs.time),
                        t2 = Utilities.timevalue(obj2[0].departs.time);
                    return Utilities.compare(t1, t2);
                });
        } else {
            currentTime = Utilities.timevalue(time);
            result = Schedule.timeSortedSchedulesFromStop(source, destination, day).filter(function (v) {
                return Utilities.timevalue(v[0].departs.time) >= currentTime;
            });
        }
        return result;
    },

    // Basic javascript interaction interfaces

    firstDepartureInRoute: function (route, source, time, day) {
        try {
            var targetTime = Utilities.timevalue(time);
            return Schedule.data[route][source].departures.reduce(function (result, departure) {
                var currentTime = Utilities.timevalue(departure.time);
                if (currentTime >= targetTime && Utilities.contains(departure.days, day)) {
                    if (result) {
                        if (Utilities.timevalue(result.time) <= currentTime) {
                            return result;
                        }
                    }
                    return departure;
                }
                return result;
            }, null);
        } catch (e) {
            return {};
        }
    },

    firstArrivalFromStop: function (source, route, destination, time, day) {
        try {
            var targetTime = Utilities.timevalue(time);
            return Schedule.data[route][destination].arrivals.reduce(function (result, arrival) {
                var currentTime = Utilities.timevalue(arrival.time);
                if (currentTime > targetTime && (arrival.from === source) && Utilities.contains(arrival.days, day)) {
                    if (result) {
                        if (currentTime >= Utilities.timevalue(result.time)) {
                            return result;
                        }
                    }
                    return arrival;
                }
                return result;
            });
        } catch (e) {
            return {};
        }
    },

    pathForRoute: function (route, source, destination, time, day) {
        var result = [],
            currentStop = source,
            currentTime = time,
            arrival,
            departure;
        while (true) {
            departure = Schedule.firstDepartureInRoute(route, currentStop, currentTime, day);
            if (!departure) {
                result = null;
                return null;
            }
            if (source === departure.to) {
                result = null;
                return null;
            }
            currentTime = departure.time;
            arrival = Schedule.firstArrivalFromStop(currentStop, route, departure.to, currentTime, day);
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

};
