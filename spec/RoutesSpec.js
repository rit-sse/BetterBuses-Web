describe("Routes", function() {
    Routes.data = $.parseJSON($.ajax({
        url: "spec/mocks/mock.json",
        async: false
    }).responseText);

    it("has route data", function () {
        expect(Object.keys(Routes.data).length).toBeGreaterThan(0);
    });

    it("gets all stops in the schedule", function () {
        expect(Routes.stops()).toEqual(["One", "Two", "Three", "Four"].sort());
    });

    it("gets all routes in the schedule", function () {
        expect(Routes.routes()).toEqual(["Route A", "Route B"]);
    });

    it("gets the stops for a route", function () {
        expect(Routes.stopsForRoute("Route A")).toEqual(["One", "Two", "Three"].sort());
        expect(Routes.stopsForRoute("Route B")).toEqual(["Two", "Three", "Four"].sort());
    });

    it("gets the routes for a stop", function () {
        expect(Routes.routesForStop("One")).toEqual(["Route A"]);
        expect(Routes.routesForStop("Two")).toEqual(["Route A", "Route B"].sort());
        expect(Routes.routesForStop("Three")).toEqual(["Route A", "Route B"].sort());
        expect(Routes.routesForStop("Four")).toEqual(["Route B"]);
    });

    it("gets the stops reachable from a stop", function () {
        expect(Routes.stopsReachableFromStop("One")).toEqual(["Two", "Three"].sort());
        expect(Routes.stopsReachableFromStop("Two")).toEqual(["One", "Three", "Four"].sort());
        expect(Routes.stopsReachableFromStop("Three")).toEqual(["One", "Two", "Four"].sort());
        expect(Routes.stopsReachableFromStop("Four")).toEqual(["Two", "Three"].sort());
    });
});
