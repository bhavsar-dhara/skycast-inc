/**
 * Created by Dhara on 6/23/2016.
 */
(function() {
    angular
        .module('core')
        .filter('cmdate', [
            '$filter', function ($filter) {
                return function (input, format) {
                    return $filter('date')(new Date(input), format);
                };
            }
        ])
        .filter('unique', function() {
            return function(collection, keyname) {
                var output = [],
                    keys = [];

                angular.forEach(collection, function(item) {
                    var key = item[keyname];
                    if(keys.indexOf(key) === -1) {
                        keys.push(key);
                        output.push(item);
                    }
                });

                return output;
            };
        });
})();