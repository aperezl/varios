angular.module('starter.service', ['ionic', 'ngCordova'])

.factory('$localStorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])
.factory('geoLocation', function($localStorage, $http, $state) {
    return {
        setGeolocation: function(latitude, longitude) {
            var _position = {
                latitude: latitude,
                longitude: longitude
            }
            $localStorage.setObject('geoLocation', _position)
            console.log('localizado');
        },
        getGeolocation: function() {
            return glocation = {
                lat: $localStorage.getObject('geoLocation').latitude,
                lng: $localStorage.getObject('geoLocation').longitude
            }
        },
        getDistance: function(lat2, lon2) {
            var lat1 = $localStorage.getObject('geoLocation').latitude;
            var lon1 = $localStorage.getObject('geoLocation').longitude;
            var radlat1 = Math.PI * lat1/180
            var radlat2 = Math.PI * lat2/180
            var radlon1 = Math.PI * lon1/180
            var radlon2 = Math.PI * lon2/180
            var theta = lon1-lon2
            var radtheta = Math.PI * theta/180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180/Math.PI
            dist = dist * 60 * 1.1515
            dist = dist * 1.609344;
            if(dist>1) {
                dist = dist.toFixed(2) + ' Km';
            } else {
                dist = parseInt(dist * 1000) + ' m';
            }
            return dist
        },
        setStations: function(cb) {
          var pos = this.getGeolocation();
          $http.get('http://unuko.com:7777/gas?lat=' + pos.lat + '&lon=' + pos.lng)
            .then(function(stations) {
              $localStorage.setObject('stations', stations);
              console.log('grabado');
              cb(stations);
            }, function(err) {
              console.log('ERR', err);
            });
        },
        getStations: function() {
          return $localStorage.getObject('stations');
        }
    }
})
