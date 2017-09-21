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

        var address;
        var map;
        vm.lat = undefined;
        vm.lng = undefined;
        vm.markers = [];
        var infoWindow = undefined;

        this.myDate = new Date();

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
                            // console.log("place = " + place);
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

        function getCityName(lat, lng) {
            console.log("lat = " + lat);
            console.log("lng = " + lng);

            var geocoder = new google.maps.Geocoder;
            var latlong = new google.maps.LatLng(lat, lng);

            geocoder.geocode(
                {'location': latlong},
                function(results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            address = results[0].formatted_address;
                        } else {
                            console.error('No results found');
                        }
                    } else {
                        console.error('Reverse Geocode was not successful for the following reason: ' + status);
                    }
                });
        }

        function searchWeatherDetails() {
            // console.log("in search weather details");

            // getCityName(vm.lat, vm.lng);

            // GoogleMapService.getCityName(vm.lat, vm.lng)
            //     .then(
            //         function (response) {
            //             data = response.data;
            //             console.log("data = " + JSON.stringify(data));
            //
            //             // vm.cityName = ;
            //         },
            //         function (error) {
            //             console.error("Something went wrong fetching reverse geocode city name..." + error);
            //         }
            //     );

            ForecastService
                .searchForecast(vm.lat, vm.lng)
                .then(
                    function (response) {
                        data = response.data;
                        // console.log("data = " + JSON.stringify(data));

                        $('#weatherDetails').html('<h3 class="city">' + vm.location + '</h3>');

                        readForecastData(data);

                        dropMarker(data);
                    },
                    function (error) {
                        console.error("Something went wrong fetching weather details..." + error);
                    }
                )
        }

        function readForecastData(data) {

            // $('#showGraph').html('');
            // $scope.myDate = new Date();

            // console.log("readForecastData()");

            // Hold our days of the week for reference later.
            var days = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ];

            // Hold hourly values for each day of the week.
            // This will store our 24 hour forecast results.
            var sunday    = [],
                monday    = [],
                tuesday   = [],
                wednesday = [],
                thursday  = [],
                friday    = [],
                saturday  = [];

            for(var j = 0, k = data.hourly.data.length; j < k; j++) {
                var hourly_date    = new Date(data.hourly.data[j].time * 1000),
                    hourly_day     = days[hourly_date.getDay()],
                    hourly_temp    = data.hourly.data[j].temperature;

                // push 24 hour forecast values to our empty days array
                switch(hourly_day) {
                    case 'Sunday':
                        sunday.push(hourly_temp);
                        break;
                    case 'Monday':
                        monday.push(hourly_temp);
                        break;
                    case 'Tuesday':
                        tuesday.push(hourly_temp);
                        break;
                    case 'Wednesday':
                        wednesday.push(hourly_temp);
                        break;
                    case 'Thursday':
                        thursday.push(hourly_temp);
                        break;
                    case 'Friday':
                        friday.push(hourly_temp);
                        break;
                    case 'Saturday':
                        saturday.push(hourly_temp);
                        break;
                    default: console.log(hourly_date.toLocaleTimeString());
                        break;
                }
            }

            // Hourly report method to reference in our daily loop
            function hourlyReport(day, selector) {
                for(var i = 0, l = day.length; i < l; i++) {
                    $("." + selector + " " + "ul").append('<li>' + Math.round(day[i]) + '</li>');
                }
            }

            // Loop through daily forecasts
            for(var i = 0, l = data.daily.data.length; i < l - 1; i++) {

                var date = new Date(data.daily.data[i].time * 1000),
                    day = days[date.getDay()],
                    skyIcons = data.daily.data[i].icon,
                    time = data.daily.data[i].time,
                    humidity = data.daily.data[i].humidity,
                    summary = data.daily.data[i].summary,
                    temp = Math.round(data.hourly.data[i].temperature),
                    tempMax = Math.round(data.daily.data[i].temperatureMax);

                // append Markup for each Forecast of the 7 day week
                $("#forecast").append(
                    '<li class="shade-' + skyIcons + '">' +
                    '<div class="card-container">' +
                    '<div><div class="front card"><div>' +
                    "<div class='graphic'><canvas class=" + skyIcons + "></canvas></div>" +
                    "<div><b>Day</b>: " + date.toLocaleDateString() + "</div>" +
                    "<div><b>Temperature</b>: " + temp + "</div>" +
                    "<div><b>Max Temp.</b>: " + tempMax + "</div>" +
                    "<div><b>Humidity</b>: " + humidity + "</div>" +
                    '<p class="summary">' + summary + '</p>' +
                    '</div></div><div class="back card">' +
                    '<div class="hourly' + ' ' + day + '">' +
                    '<b>24hr Forecast</b>' +
                    '<ul class="list-reset"></ul></div></div></div></div></li>'
                );

                $('#weatherDetails').append('<ul class="list-reset" id="forecast"></ul>');

                // Daily forecast report for each day of the week
                switch (day) {
                    case 'Sunday':
                        hourlyReport(sunday, days[0]);
                        break;
                    case 'Monday':
                        hourlyReport(monday, days[1]);
                        break;
                    case 'Tuesday':
                        hourlyReport(tuesday, days[2]);
                        break;
                    case 'Wednesday':
                        hourlyReport(wednesday, days[3]);
                        break;
                    case 'Thursday':
                        hourlyReport(thursday, days[4]);
                        break;
                    case 'Friday':
                        hourlyReport(friday, days[5]);
                        break;
                    case 'Saturday':
                        hourlyReport(saturday, days[6]);
                        break;
                }

            }
        }

        function dropMarker(info) {

            var details = info.currently;

            var marker = new google.maps.Marker({
                map: vm.map,
                position: new google.maps.LatLng(info.latitude, info.longitude),
                title: details.summary,
                time: new Date(details.time * 1000).toLocaleDateString(),
                temperature: details.temperature,
                windSpeed: details.windSpeed,
                imgSkyIcon: details.icon,
                timezone: info.timezone,
                placeName: vm.location
            });

            marker.content = '<div class="infoWindowContent">'
                + 'Temperature :' + marker.temperature
                + '<p>' + 'Wind Speed :' + marker.windSpeed + '</p>'
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

        $scope.viewHistoricData = function () {

            if($scope.myDate !== undefined) {
                var pastDate = Date.parse($scope.myDate.toDateString()) / 1000;

                // Hold our days of the week for reference later.
                var days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ];

                // Hold hourly values for each day of the week.
                // This will store our 24 hour forecast results.
                var sunday    = [],
                    monday    = [],
                    tuesday   = [],
                    wednesday = [],
                    thursday  = [],
                    friday    = [],
                    saturday  = [];

                $scope.options = {
                    chart: {
                        type: 'lineChart',
                        height: 450,
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 40,
                            left: 55
                        },
                        x: function (d) {
                            return d.x;
                        },
                        y: function (d) {
                            return d.y;
                        },
                        useInteractiveGuideline: true,
                        dispatch: {
                            stateChange: function (e) {
                                console.log("stateChange");
                            },
                            changeState: function (e) {
                                console.log("changeState");
                            },
                            tooltipShow: function (e) {
                                console.log("tooltipShow");
                            },
                            tooltipHide: function (e) {
                                console.log("tooltipHide");
                            }
                        },
                        xAxis: {
                            axisLabel: 'Time (hr)'
                        },
                        yAxis: {
                            axisLabel: 'Temperature (F)',
                            tickFormat: function(d){
                                return d3.format('.02f')(d);
                            },
                            axisLabelDistance: -10
                        },
                        callback: function (chart) {
                            console.log("!!! lineChart callback !!!");
                            // chart.update();
                        }
                    },
                    title: {
                        enable: true,
                        text: 'Weather History Graph of ' + vm.location
                    },
                    subtitle: {
                        enable: true,
                        text: 'Temperature in Fahrenheit',
                        css: {
                            'text-align': 'center',
                            'margin': '10px 13px 0px 7px'
                        }
                    },
                    caption: {
                        enable: true,
                        html: '<b>Figure 1.</b> Temperature Graph',
                        css: {
                            'text-align': 'justify',
                            'margin': '10px 13px 0px 7px'
                        }
                    }
                };

                $scope.data = getData();
                // var resultData = [];

                // $scope.$apply();

                function getData() {
                    ForecastService
                        .searchTimeMachine(vm.lat, vm.lng, pastDate)
                        .then(
                            function (response) {
                                data = response.data;
                                // console.log("data = " + JSON.stringify(data));

                                $('#weatherDetails').html('');

                                for (var j = 0, k = data.hourly.data.length; j < k; j++) {
                                    var hourly_date = new Date(data.hourly.data[j].time * 1000),
                                        hourly_day = days[hourly_date.getDay()],
                                        hourly_temp = data.hourly.data[j].temperature;

                                    // push 24 hour forecast values to our empty days array
                                    switch (hourly_day) {
                                        case 'Sunday':
                                            sunday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Monday':
                                            monday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Tuesday':
                                            tuesday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Wednesday':
                                            wednesday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Thursday':
                                            thursday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Friday':
                                            friday.push({x: j, y: hourly_temp});
                                            break;
                                        case 'Saturday':
                                            saturday.push({x: j, y: hourly_temp});
                                            break;
                                        default:
                                            console.log(hourly_date.toLocaleTimeString());
                                            break;
                                    }
                                }

                                // console.log("saturday = " + saturday);

                                return [
                                    {
                                        values: sunday,      //values - represents the array of {x,y} data points
                                        key: 'Sun Temp', //key  - the name of the series.
                                        color: '#ff7f0e'  //color - optional: choose your own line color.
                                    },
                                    {
                                        values: monday,
                                        key: 'Mon Temp',
                                        color: '#2ca02c'
                                    },
                                    {
                                        values: tuesday,
                                        key: 'Tues Temp',
                                        color: '#7777ff'
                                    },
                                    {
                                        values: wednesday,      //values - represents the array of {x,y} data points
                                        key: 'Wed Temp', //key  - the name of the series.
                                        color: '#ff2238'  //color - optional: choose your own line color.
                                    },
                                    {
                                        values: thursday,
                                        key: 'Thurs Temp',
                                        color: '#00a08f'
                                    },
                                    {
                                        values: friday,
                                        key: 'Fri Temp',
                                        color: '#cd05ff'
                                    },
                                    {
                                        values: saturday,      //values - represents the array of {x,y} data points
                                        key: 'Sat Temp', //key  - the name of the series.
                                        color: '#ffd300'  //color - optional: choose your own line color.
                                    }
                                ];
                            },
                            function (error) {
                                console.error("Something went wrong fetching weather details..." + error);
                            }
                        )
                }

            } else {
                alert("Please select a date");
            }
        }
    }
})();