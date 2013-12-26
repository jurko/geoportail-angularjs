var geoportailApp = angular.module('geoportailApp', [
    'ngRoute',
    'appControllers',
    'geoportailMap'
]);

geoportailApp.config(["geoportailMapProvider", function(geoportailMapProvider) {
    geoportailMapProvider.setApiKey(YOUR_KEY);
}]);

geoportailApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/ign-full', {
                templateUrl: 'partials/ign-full.html',
                controller: 'geoportailMapController'
            }).
            when('/ign-fixed', {
                templateUrl: 'partials/ign-fixed.html',
                controller: 'geoportailMapController'
            }).
            otherwise({
                redirectTo: '/ign-full'
            });
    }]);
