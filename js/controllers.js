var controllers = angular.module('appControllers', ['geoportailMap']);

controllers.controller('mainController', ['$scope', '$http',
    function mainController($scope, $http) {
        $scope.foo = 'foo';
        $scope.bar = 'bar'
    }]);

controllers.controller('geoportailMapController', ['$scope', '$log', 'geoportailMap',
    function geoportailMapController($scope, $log, geoportailMap) {
//        geoportailMap.createMap('map').then(function (map) {
//            //map.setSize(100, 100);
//            map.getMap().setCenterAtLonLat(5.74, 45.17, 9);
//        });
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
