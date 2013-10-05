/*
$.getJSON("data/schedule.json", function (data) {
    console.log(data);
    Routes.data = data;

    // TODO: Set properties of $scope here.
}).fail(function () {
    console.log("An error has occured in loading schedule.json.");
});
*/

function StopListController($scope) {
    $scope.stops = ["Colony Manor", "Gleason Circle"];
}

var BetterBusesApp = angular.module('BetterBusesApp', []);
BetterBusesApp.controller('StopListController', StopListController);
