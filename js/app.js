// Declare app level module
angular.module("BetterBusesApp", [])
    .controller("StopListController", function ($scope, $http) {
        $scope.loadState = "loading";
        $http.get("data/schedule.json").success(function (data) {
            var schedule = new Schedule(data);

            $scope.stops = schedule.stops();
            $scope.loadState = "success";
        }).error(function () {
            $scope.loadState = "failure";
        });
    });
