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

//TODO, rework full html height
controllers.directive('resizeFull', function($window) {
    return {
        link: function(scope, element, attrs) {
            var w = angular.element($window);
            w.bind('resize', function() {
                element.css('height', $window.innerHeight - 55 + 'px');
                element.css('width', $window.innerWidth - 22 + 'px');
                scope.$broadcast('resizeEvent', {height: $window.innerHeight, width: $window.innerWidth});
            });
            w.bind('DOMContentLoaded', function() {
                element.css('height', $window.innerHeight - 55 + 'px');
                element.css('width', $window.innerWidth - 22 + 'px');
                scope.$broadcast('resizeEvent', {height: $window.innerHeight, width: $window.innerWidth});
            })
        }
    }
});
