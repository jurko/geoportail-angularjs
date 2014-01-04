var controllers = angular.module('appControllers', ['geoportailMap']);

controllers.controller('mainController', ['$scope', '$http',
    function mainController($scope, $http) {
        $scope.foo = 'foo';
        $scope.bar = 'bar'
    }]);

controllers.controller('geoportailMapController', ['$scope', '$log', 'geoportailMap',
    function geoportailMapController($scope, $log, geoportailMap) {
        $scope.mapGnb = {name: 'Grenoble', lon: 5.74, lat: 45.17, zoom: 9};
        $scope.mapCham = {name: 'Chamonix', lon: 6.87, lat: 45.92, zoom: 9};
    }]);
