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

    function GoogleMapService($http) {
        var api = {
            loadGMap: loadGMap
        };
        return api;

        function loadGMap() {

            var url = urlBase
                .replace("API_KEY", key);

            // console.log("gmap url = " + url);
            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        }
    }

})();
