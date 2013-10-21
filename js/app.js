// Declare app level module
angular.module("BetterBusesApp", [])
    .service("schedule", function ($q, $http) {
        this.stops = function () {
            var deferred = $q.defer();

            $http.get("data/schedule.json").success(function (data) {
                Schedule.data = data;
                deferred.resolve(Schedule.stops());
            }).error(function () {
                deferred.reject();
            });

            return deferred.promise;
        };
    }).controller("StopListController", function ($scope, schedule) {
        $scope.loadState = "loading";
        schedule.stops().then(function (data) {
            $scope.loadState = "success";
            $scope.stops = data;
        }, function () {
            $scope.loadState = "failure";
        });
    });
