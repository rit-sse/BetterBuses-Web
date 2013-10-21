describe("Schedule", function () {
    it("has route data", function () {
        expect(Schedule.data).not.toEqual({});
    });

    it("gets all stops in the schedule", function () {
        expect(Schedule.stops()).toEqual(["One", "Two", "Three", "Four"].sort());
    });

    it("gets all routes in the schedule", function () {
        expect(Schedule.routes()).toEqual(["Route A", "Route B"]);
    });

    it("gets the stops for a route", function () {
        expect(Schedule.stopsForRoute("Route A")).toEqual(["One", "Two", "Three"].sort());
        expect(Schedule.stopsForRoute("Route B")).toEqual(["Two", "Three", "Four"].sort());
    });

    it("gets the routes for a stop", function () {
        expect(Schedule.routesForStop("One")).toEqual(["Route A"]);
        expect(Schedule.routesForStop("Two")).toEqual(["Route A", "Route B"].sort());
        expect(Schedule.routesForStop("Three")).toEqual(["Route A", "Route B"].sort());
        expect(Schedule.routesForStop("Four")).toEqual(["Route B"]);
    });

    it("gets the stops reachable from a stop", function () {
        expect(Schedule.stopsReachableFromStop("One")).toEqual(["Two", "Three"].sort());
        expect(Schedule.stopsReachableFromStop("Two")).toEqual(["One", "Three", "Four"].sort());
        expect(Schedule.stopsReachableFromStop("Three")).toEqual(["One", "Two", "Four"].sort());
        expect(Schedule.stopsReachableFromStop("Four")).toEqual(["Two", "Three"].sort());
    });

    it("gets the schedule for a route", function () {
        expect(Schedule.scheduleForRoute("Route A", "One", "Three", "Monday")).toEqual([[
            {
                departs : { to : 'Two', time : '8:00', days : [ 'Monday' ] },
                arrives : { from : 'One', time : '8:10', days : [ 'Monday' ] },
                route : 'Route A'
            }, {
                departs : { to : 'Three', time : '8:10', days : [ 'Monday' ] },
                arrives : { from : 'Two', time : '8:20', days : [ 'Monday' ] },
                route : 'Route A'
            }
        ]]);

        expect(Schedule.scheduleForRoute("Route B", "One", "Four", "Monday")).toEqual([]);
        expect(Schedule.scheduleForRoute("Route B", "Two", "Three", "Tuesday")).toEqual([]);

        expect(Schedule.scheduleForRoute("Route A", "Fake", "Fake", "Monday")).toEqual([]);
        expect(Schedule.scheduleForRoute("Fake", "Two", "Three", "Monday")).toEqual([]);
        expect(Schedule.scheduleForRoute("Fake", "Fake", "Fake", "Monday")).toEqual([]);
    });

    it("gets the schedules for multiple routes", function () {
        expect(Schedule.schedulesForRoutes(["Route A", "Route B"], "One", "Two", "Monday")).toEqual({
            "Route A": [[{
                departs : { to : 'Two', time : '8:00', days : [ 'Monday' ] },
                arrives : { from : 'One', time : '8:10', days : [ 'Monday' ] },
                route : 'Route A'
            }]],
            "Route B": []
        });

        expect(Schedule.schedulesForRoutes(["Route A", "Route B"], "Two", "Three", "Monday")).toEqual({
            "Route A": [[{
                departs : { to : 'Three', time : '8:10', days : [ 'Monday' ] },
                arrives : { from : 'Two', time : '8:20', days : [ 'Monday' ] },
                route : 'Route A'
            }]],
            "Route B": [[{
                departs : { to : 'Three', time : '8:00P', days : [ 'Monday' ] },
                arrives : { from : 'Two', time : '8:10P', days : [ 'Monday' ] },
                route : 'Route B'
            }]]
        });

        expect(Schedule.schedulesForRoutes(["Route A", "Route B"], "Two", "Three", "Tuesday")).toEqual({
            "Route A": [],
            "Route B": []
        });
    });

    it("gets the schedules for any routes starting at a specific stop", function () {
        expect(Schedule.routeSchedulesFromStop("One", "Two", "Monday")).toEqual({
            "Route A": [[{
                departs : { to : 'Two', time : '8:00', days : [ 'Monday' ] },
                arrives : { from : 'One', time : '8:10', days : [ 'Monday' ] },
                route : 'Route A'
            }]]
        });
    });

    it("gets the schedules for any routes starting at a specific stop, sorted by departure time", function () {
        expect(Schedule.timeSortedSchedulesFromStop("Two", "Three",
                "Monday")).toEqual([
            [{
                departs : { to : 'Three', time : '8:10', days : [ 'Monday' ] },
                arrives : { from : 'Two', time : '8:20', days : [ 'Monday' ] },
                route : 'Route A'
            }],
            [{
                departs : { to : 'Three', time : '8:00P', days : [ 'Monday' ] },
                arrives : { from : 'Two', time : '8:10P', days : [ 'Monday' ] },
                route : 'Route B'
            }]
        ]);
    });

    it("gets the first departure in a route", function () {
        expect(Schedule.firstDepartureInRoute("Route A", "One", "7:50A", "Monday")).toEqual({
            "to" : "Two",
            "time" : "8:00",
            "days" : [ "Monday" ]
        });
        expect(Schedule.firstDepartureInRoute("Route B", "One", "7:50A", "Monday")).toEqual({});
    });

    it("gets the first arrival from a stop", function () {
        expect(Schedule.firstArrivalFromStop("One", "Route A", "Three", "8:20", "Monday")).toEqual({
            "from" : "Two",
            "time" : "8:20",
            "days" : [ "Monday" ]
        });
        expect(Schedule.firstArrivalFromStop("One", "Route A", "Four", "7:50A", "Monday")).toEqual({});
    });

    it("gets the path for a route", function () {
        expect(Schedule.pathForRoute("Route A", "One", "Three", "7:50A", "Monday")).toEqual([{
            departs: {
                "to" : "Two",
                "time" : "8:00",
                "days" : [ "Monday" ]
            },
            arrives: {
                "from" : "One",
                "time" : "8:10",
                "days" : [ "Monday" ]
            },
            route: "Route A"
        }, {
            departs: {
                "to" : "Three",
                "time" : "8:10",
                "days" : [ "Monday" ]
            },
            arrives: {
                "from" : "Two",
                "time" : "8:20",
                "days" : [ "Monday" ]
            },
            route: "Route A"
        }]);
    });
});
