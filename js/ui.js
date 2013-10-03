/*
$.getJSON("data/schedule.json", function (data) {
    console.log(data);
    Routes.data = data;

    // TODO: Set properties of $scope here.
}).fail(function () {
    console.log("An error has occured in loading schedule.json.");
});
*/

function SourceListCtrl($scope) {
    $scope.sources = ["Colony Manor", "Gleason Circle"];
}

function DestinationListCtrl($scope) {
    $scope.destinations = ["Colony Manor", "Gleason Circle"];
}

var BetterBusesApp = angular.module('BetterBusesApp', []);
BetterBusesApp.controller('SourceListCtrl', SourceListCtrl);
BetterBusesApp.controller('DestinationListCtrl', DestinationListCtrl);
