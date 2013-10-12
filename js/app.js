// Declare app level module
angular.module("BetterBusesApp", [])
    .controller("StopListController", function ($scope, $http) {
        $scope.loadState = "loading";
        $http.get("data/schedule.json").success(function (data) {
            console.log(data);
            Routes.data = data;

            $scope.stops = Routes.stops();
            $scope.loadState = "success";
        }).error(function () {
            $scope.loadState = "failure";
        });
    });
