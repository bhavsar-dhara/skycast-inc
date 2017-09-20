(function () {
    angular
        .module("skycastDemo")
        .config(Config);

    function Config($routeProvider, $locationProvider, $sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self',
            new RegExp('^(http[s]?):\/\/(w{3}.)?maps.googleapis\.com/.+$'),
            new RegExp('^(http[s]?):\/\/(w{3}.)?api.eventful\.com/.+$'),
            new RegExp('^(http[s]?):\/\/(w{3}.)?api.darksky\.net/forecast.+$')]);
        $routeProvider
            .when("/", {
                templateUrl: "views/googleMapDemo.html",
                controller: "GoogleMapController",
                controllerAs: "ctrl"
            })
            .otherwise({
                redirectTo: "/"
            });
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('');
    }
})();