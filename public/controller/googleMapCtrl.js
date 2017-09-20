(function () {
    angular
        .module("skycastDemo")
        .controller("GoogleMapController", GoogleMapController)
        .directive('onFinishRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function () {
                            scope.$emit(attr.onFinishRender);
                        });
                    }
                }
            }
        });

    function GoogleMapController($routeParams, ForecastService, $sce, GoogleMapService, $scope) {
        var vm = this;
        vm.userId = $routeParams.uid;
        vm.searchText = undefined;
        vm.location = "Boston";
        vm.getSafeHtml = getSafeHtml;
        vm.getSafeUrl = getSafeUrl;

        var bos_lat = 42.3601;
        var bos_lng = -71.0589;

        var count;
        var country;
        var state;
        var city;
        var map;
        vm.lat = undefined;
        vm.lng = undefined;
        vm.markers = [];
        var infoWindow = undefined;

        function init() {
            GoogleMapService
                .loadGMap()
                .then(
                    function (response) {
                        // console.log(response);

                        map = new google.maps.Map(document.getElementById('map'), {
                            center: {lat: bos_lat, lng: bos_lng},
                            zoom: 10,
                            disableDefaultUI: true
                        });

                        var infoWindowGeo = new google.maps.InfoWindow();

                        // Try HTML5 geolocation.
                        if (navigator.geolocation) {
                            // console.log("in if");
                            vm.lat = bos_lat;
                            vm.lng = bos_lng;

                            navigator.geolocation.getCurrentPosition(function (position) {
                                var pos = {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude
                                };

                                vm.lat = pos.lat;
                                vm.lng = pos.lng;

                                searchWeatherDetails();
                                // console.log(navigator.geolocation);
                                // getCityName(pos.lat, pos.lng);

                                // infoWindowGeo.setPosition(pos);
                                // infoWindowGeo.setContent('Location found.');
                                map.setCenter(pos);
                            }, function () {
                                handleLocationError(true, infoWindowGeo, map.getCenter());
                            });
                        } else {
                            // console.log("in else.. redirecting to opena default location");
                            vm.lat = bos_lat;
                            vm.lng = bos_lng;

                            searchWeatherDetails();
                            // Browser doesn't support Geolocation
                            handleLocationError(false, infoWindowGeo, map.getCenter());
                        }

                        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                            infoWindow.setPosition(pos);
                            infoWindow.setContent(browserHasGeolocation ?
                                'Error: The Geolocation service failed.' :
                                'Error: Your browser doesn\'t support geolocation.');
                        }

                        var input = /** @type {!HTMLInputElement} */(
                            document.getElementById('pac-input'));
                        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                        var autocomplete = new google.maps.places.Autocomplete(input, {types: ['geocode']});
                        autocomplete.bindTo('bounds', map);

                        autocomplete.addListener('place_changed', function() {
                            document.getElementById('pac-input').focus();
                            var place = autocomplete.getPlace();
                            if (!place.geometry) {
                                window.alert("Autocomplete's returned place contains no geometry");
                                return;
                            }
                            // console.log(place);
                            vm.location = place.name;
                            // console.log(vm.location);
                            vm.lat = place.geometry.location.lat;
                            vm.lng = place.geometry.location.lng;

                            searchWeatherDetails();

                            // If the place has a geometry, then present it on a map.
                            if (place.geometry.viewport) {
                                map.fitBounds(place.geometry.viewport);
                            } else {
                                map.setCenter(place.geometry.location);
                                map.setZoom(10);  // Why 17? Because it looks good.
                            }

                            var address = '';
                            if (place.address_components) {
                                address = [
                                    (place.address_components[0] && place.address_components[0].short_name || ''),
                                    (place.address_components[1] && place.address_components[1].short_name || ''),
                                    (place.address_components[2] && place.address_components[2].short_name || '')
                                ].join(' ');
                            }
                        });

                        infoWindow = new google.maps.InfoWindow();

                        vm.openInfoWindow = function(e, selectedMarker){
                            // console.log("in onClick");
                            e.preventDefault();
                            google.maps.event.trigger(selectedMarker, 'click');
                        };
                    }
                );
        }
        init();

        function searchWeatherDetails() {
            console.log("in search weather details");
            ForecastService
                .searchForecast(vm.lat, vm.lng)
                .then(
                    function (response) {
                        data = response.data;
                        console.log("data = " + JSON.stringify(data));

                        dropMarker(data);

                        // skycons();
                    },
                    function (error) {
                        console.error("Something went wrong fetching weather details..." + error);
                    }
                )
        }

        function dropMarker(info) {

            var details = info.currently;

            var marker = new google.maps.Marker({
                map: vm.map,
                position: new google.maps.LatLng(info.latitude, info.longitude),
                title: details.summary,
                startTime: details.time,
                venueName: details.temperature,
                venueAddress: details.windSpeed,
                imgUrl: details.icon,
                eventId: info.timezone
            });

            marker.content = '<div class="infoWindowContent">'
                + marker.venueName
                + '<p>' + marker.venueAddress + '</p>'
                + '</div>';

            google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<div class="capitalize"><strong>' + marker.title.toLowerCase() + '</strong><br>' + marker.content);
                infoWindow.open(vm.map, marker);
            });

            marker.setMap(map);

            vm.markers.push(marker);
        }

        $scope.$on('ngRepeatFinished', function() {
            skycons();
        });

        function getSafeHtml(description) {
            if(description !== null) {
                return $sce.trustAsHtml(description);
            }
        }

        function getSafeUrl(eventUrl) {
            if(eventUrl !== null) {
                return $sce.trustAsResourceUrl(eventUrl);
            }
        }

    }
})();