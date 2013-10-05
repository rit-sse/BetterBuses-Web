// Declare app level module
angular.module("BetterBusesApp", [])
    .controller("StopListController", function ($scope, $http) {
        $scope.loaded = false;
        $http.get("data/schedule.json").success(function (data) {
            console.log(data);
            Routes.data = data;

            $scope.stops = Routes.stops();
            $scope.loaded = true;
        }).error(function () {
            console.log("An error has occured in loading schedule.json.");
        });
    });
