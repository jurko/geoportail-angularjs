var geoportailApp = angular.module('geoportailApp', [
    'ngRoute',
    'appControllers',
    'geoportailMap'
]);

geoportailApp.config(["geoportailMapLoaderProvider", function(geoportailMapLoaderProvider) {
    geoportailMapLoaderProvider.setApiKey(YOUR_KEY);
}]);

geoportailApp.config(['$routeProvider', 'geoportailMapLoaderProvider',
    function($routeProvider, geoportailMapLoaderProvider) {
        $routeProvider.
            when('/ign-full', {
                templateUrl: 'partials/ign-full.html',
                controller: 'geoportailMapController',
                resolve: {
                    geoportail: geoportailMapLoaderProvider.loadApi
                }
            }).
            when('/ign-fixed', {
                templateUrl: 'partials/ign-fixed.html',
                controller: 'geoportailMapController',
                resolve: {
                    geoportail: geoportailMapLoaderProvider.loadApi
                }
            }).
            when('/ign-multiple', {
                templateUrl: 'partials/ign-multiple.html',
                controller: 'geoportailMapController',
                resolve: {
                    geoportail: geoportailMapLoaderProvider.loadApi
                }
            }).
            when('/test', {
                templateUrl: 'partials/ign-fixed.html',
                controller: 'geoportailMapController',
                resolve: {
                    geoportail: geoportailMapLoaderProvider.loadApi
                }
            }).
            otherwise({
                redirectTo: '/ign-full'
            });
    }]);
