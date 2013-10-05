/*
$.getJSON("data/schedule.json", function (data) {
    console.log(data);
    Routes.data = data;

    // TODO: Set properties of $scope here.
}).fail(function () {
    console.log("An error has occured in loading schedule.json.");
});
*/

// Declare app level module
angular.module("BetterBusesApp", [])
    .controller("StopListController", function ($scope) {
        $scope.stops = ["Colony Manor", "Gleason Circle"];
    });
