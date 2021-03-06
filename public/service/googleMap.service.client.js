// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

(function () {
    angular
        .module("skycastDemo")
        .factory("GoogleMapService", GoogleMapService);

    // TODO - how to securing place key
    var key = "AIzaSyAhIYpsO8Jdq1eBxaH6u7N7Tvej3UckyHE";
    var urlBase = "//maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places";
    var urlReverseGeocode = "//maps.googleapis.com/maps/api/geocode/json?key=API_KEY&latlng=LAT,LNG&sensor=true";

    function GoogleMapService($http) {
        var api = {
            loadGMap: loadGMap,
            getCityName: getCityName
        };
        return api;

        function loadGMap() {

            var url = urlBase
                .replace("API_KEY", key);

            // console.log("gmap url = " + url);
            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        }

        function getCityName(lat, lng) {
            // console.log("lat = " + lat);
            // console.log("lng = " + lng);
            var url = urlReverseGeocode
                .replace("API_KEY", key)
                .replace("LAT", lat)
                .replace("LNG", lng);

            // console.log("gmap url = " + url);
            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        }
    }

})();
