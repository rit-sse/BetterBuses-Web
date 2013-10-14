// Declare app level module
angular.module("BetterBusesApp", [])
    .controller("StopListController", function ($scope, $http) {
        var schedule = new Schedule();
        $scope.loadState = "loading";
        $http.get("data/schedule.json").success(function (data) {
            schedule.data = data;

            $scope.stops = schedule.stops();
            $scope.loadState = "success";
        }).error(function () {
            $scope.loadState = "failure";
        });
    });
