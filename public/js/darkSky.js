// to replace skycons icons in place of the icon
function skycons() {

    var icons = new Skycons({
            "color" : "#FFFFFF"
            // ,
            // "resizeClear": true // nasty android hack
        }),
        list  = [ // listing of all possible icons
            "clear-day",
            "clear-night",
            "partly-cloudy-day",
            "partly-cloudy-night",
            "cloudy",
            "rain",
            "sleet",
            "snow",
            "wind",
            "fog"
        ];

    // loop thru icon list array
    for(var i = 0; i < list.length; i++) {
        var weatherType = list[i], // select each icon from list array
            // icons will have the name in the array above attached to the
            // canvas element as a class so let's hook into them.
            elements = document.getElementsByClassName(weatherType);

        // loop through the elements now and set them up
        for (var e = 0; e < elements.length; e++) {
            icons.set(elements[e], weatherType);
        }
    }

    // animate the icons
    icons.play();
}

// convert fahrenheit to celsius
function fToC(fTemp) {
    return (fTemp - 32) * 5 / 9;
}