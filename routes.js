// Utility methods
var Utilities = {

    timevalue: function (t) {
        var tenHour = 0,
            oneHour = 0,
            tenMin = 0,
            oneMin = 0,
            rawTime;
        switch (t.length) {
        case 4:
            oneHour = parseInt(t[0], 10);
            tenMin = parseInt(t[2], 10);
            oneMin = parseInt(t[3], 10);
            break;
        case 5:
            if (t[4] === "P" || t[4] === "p" || t[4] === "A" || t[4] === "a") {
                oneHour = parseInt(t[0], 10);
                if (t[4] === "P" || t[4] === "p") {
                    oneHour += 12;
                }
                tenMin = parseInt(t[2], 10);
                oneMin = parseInt(t[3], 10);
            } else {
                tenHour = parseInt(t[0], 10);
                oneHour = parseInt(t[1], 10);
                if (tenHour === 1 && oneHour === 2) {
                    tenHour = 0;
                    oneHour = 0;
                }
                tenMin = parseInt(t[3], 10);
                oneMin = parseInt(t[4], 10);
            }
            break;
        case 6:
            tenHour = parseInt(t[0], 10);
            oneHour = parseInt(t[1], 10);
            if (t[5] === "P" || t[5] === "p") {
                if (!(tenHour === 1 && oneHour === 2)) {
                    oneHour += 12;
                }
            }
            tenMin = parseInt(t[3], 10);
            oneMin = parseInt(t[4], 10);
            break;
        }
        function postMidnightTimeValue(tVal) {
            var result = tVal,
                strVal = String(tVal);
            if (strVal.length === 3) {
                if (parseInt(strVal[0], 10) < 5) {
                    result = parseInt(strVal, 10) + 2400;
                }
            }
            return result;
        }
        rawTime = (tenHour * 1000) + (oneHour * 100) + (tenMin * 10) + oneMin;
        return postMidnightTimeValue(rawTime);
    },

    // Works just like the spaceship operator (<=>) in Ruby.
    compare: function (a, b) {
        if (typeof a === 'string') {
            return a.localeCompare(b);
        }

        var result;

        if (a < b) {
            result = -1;
        } else if (a > b) {
            result = 1;
        } else {
            result = 0;
        }

        return result;
    },

    contains: function (array, object) {
        return array.indexOf(object) !== -1;
    },

    values: function (object) {
        return Object.keys(object).map(function (key) {
            return object[key];
        });
    }

};

var Routes = {

    // Read in JSON data.
    data: {},

    // Algorithm methods

    stops: function () {
        var result = [];
        Object.keys(Routes.data).forEach(function (key) {
            var routeData = Routes.data[key];
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
        Object.keys(Routes.data).forEach(function (routeKey) {
            if (!Utilities.contains(result, routeKey)) {
                result.push(routeKey);
            }
        });
        return result;
    },

    stopsForRoute: function (route) {
        var result = [];
        Object.keys(Routes.data[route]).forEach(function (stop) {
            result.push(stop);
        });
        return result.sort();
    },

    routesForStop: function (stop) {
        var result = [];
        Object.keys(Routes.data).forEach(function (routeKey) {
            if (Routes.data[routeKey][stop] !== undefined) {
                result.push(routeKey);
            }
        });
        return result.sort();
    },

    stopsReachableFromStop: function (stop) {
        var routes = Routes.routesForStop(stop),
            result = [];
        routes.forEach(function (route) {
            Routes.stopsForRoute(route).forEach(function (routeStop) {
                if (!Utilities.contains(result, routeStop) && routeStop !== stop) {
                    result.push(routeStop);
                }
            });
        });
        return result.sort();
    },

    scheduleForRoute: function (route, source, destination, day) {
        return Routes.data[route][source].departures.reduce(function (result, departure) {
            var path = Routes.pathForRoute(route, source, destination, departure.time, day);
            if (path) {
                result.push(path);
            }
            return result;
        }, []);
    },

    schedulesForRoutes: function (routes, source, destination, day) {
        var result = {};
        routes.forEach(function (route) {
            var schedule = Routes.scheduleForRoute(route, source, destination, day);
            if (schedule.size !== 0) {
                result[route] = schedule;
            }
        });
        return result;
    },

    routeSchedulesFromStop: function (source, destination, day) {
        return Routes.schedulesForRoutes(Routes.routesForStop(source), source, destination, day);
    },

    timeSortedSchedulesFromStop: function (source, destination, day, time) {
        time = time || undefined;
        if (time === undefined) {
            Utilities.values(Routes.routeSchedulesFromStop(source, destination, day)).reduce(function (result, value) {
                return result.concat(value);
            }, [])
                .sort(function (obj1, obj2) {
                    var t1 = Utilities.timevalue(obj1[0].departs.time),
                        t2 = Utilities.timevalue(obj2[0].departs.time);
                    return Utilities.compare(t1, t2);
                });
        } else {
            var currentTime = Utilities.timevalue(time);
            return Routes.timeSortedSchedulesFromStop(source, destination, day).filter(function (v) {
                return Utilities.timevalue(v[0].departs.time) >= currentTime;
            });
        }
    },

    // Basic javascript interaction interfaces

    firstDepartureInRoute: function (route, source, time, day) {
        var targetTime = Utilities.timevalue(time);
        return Routes.data[route][source].departures.reduce(function (result, departure) {
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
    },

    firstArrivalFromStop: function (source, route, destination, time, day) {
        var targetTime = Utilities.timevalue(time);
        return Routes.data[route][destination].arrivals.reduce(function (result, arrival) {
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
        }, null);
    },

    pathForRoute: function (route, source, destination, time, day) {
        var result = [],
            currentStop = source,
            currentTime = time,
            arrival,
            departure;
        while (true) {
            departure = Routes.firstDepartureInRoute(route, currentStop, currentTime, day);
            if (!departure) {
                result = null;
                return null;
            }
            if (source === departure.to) {
                result = null;
                return null;
            }
            currentTime = departure.time;
            arrival = Routes.firstArrivalFromStop(currentStop, route, departure.to, currentTime, day);
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
