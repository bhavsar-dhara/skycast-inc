/**
 * Created by Dhara on 6/19/2016.
 */
(function () {
    angular
        .module("skycastDemo")
        .factory("ForecastService", ForecastService);

    var key2 = "6c4102c02fa3594783c54aab81209a8d";
    var urlForecast = "https://api.darksky.net/forecast/API_KEY/LAT,LONG?extend=hourly/";
    var urlTimeMachine = "https://api.darksky.net/forecast/API_KEY/LAT,LONG,DATE_MS?extend=hourly/";

    function ForecastService($http) {
        var api = {
            searchForecast: searchForecast,
            searchTimeMachine: searchTimeMachine
        };
        return api;

        function searchForecast(latitude, longitude) {
            console.log("latitude = " + latitude);
            console.log("longitude = " + longitude);
            var url = urlForecast
                .replace("API_KEY", key2)
                .replace("LAT", latitude)
                .replace("LONG", longitude);
            console.log("url = " + url);
            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        }

        function searchTimeMachine(latitude, longitude, date) {
            console.log("latitude = " + latitude);
            console.log("longitude = " + longitude);
            console.log("date = " + date);
            var url = urlTimeMachine
                .replace("API_KEY", key2)
                .replace("LAT", latitude)
                .replace("LONG", longitude)
                .replace("DATE_MS", date);
            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        }
    }


})();