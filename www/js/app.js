// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'starter.service'])


.run(function($ionicPlatform, $cordovaGeolocation, geoLocation) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    console.log('Plataforma arrancada')

    $cordovaGeolocation
    .getCurrentPosition()
    .then(function(position) {
        geoLocation.setGeolocation(position.coords.latitude, position.coords.longitude)
        //geoLocation.setStations();
        console.log('then lanzado de localización, set realizado')
        console.log($ionicPlatform)
    }, function(err) {
        geoLocation.setGeolocation(37.38, -122.09)
    });

      // begin a watch
      var options = {
          frequency: 1000,
          timeout: 3000,
          enableHighAccuracy: true
      };

      var watch = $cordovaGeolocation.watchPosition(options);
      watch.then(function() { /* Not  used */ },
          function(err) {
              geoLocation.setGeolocation(37.38, -122.09)
          },
          function(position) {
              geoLocation.setGeolocation(position.coords.latitude, position.coords.longitude)
        });
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('tabs', {
    abstract: true,
    url: '/tab',
    templateUrl: 'tabs.html'
  });

  $stateProvider.state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "home.html",
          controller: 'mainCtrl'
        }
      }
    });

    $stateProvider.state('tabs.station', {
      url: '/station/:id',
      views: {
        'home-tab': {
          templateUrl: 'detalle.html',
          controller: 'mainCtrl'
        }
      }
    })

  $stateProvider.state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "about.html"
        }
      }
    });

  $urlRouterProvider.otherwise('/tab/home');
})


.factory('listaService', ['$rootScope', function($rootScope) {
  var service = {
    model: {
      name: '',
      email: '',
      lista: []
    },
    SaveState: function() {
      localStorage.listaService = angular.toJson(service.model);
      console.log('grabado')
    },
    RestoreStage: function() {
      service.model = angular.fromJson(localStorage.listaService);
      console.log('restaurado')
    }
  }

  $rootScope.$on('savestate', service.SaveState);
  $rootScope.$on('restorestate', service.RestoreStage);

  return service;
}])



.controller('mainCtrl', function($scope, $rootScope, listaService, $http, $cordovaGeolocation, geoLocation, $state) {

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
$cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    var lat  = position.coords.latitude
    var long = position.coords.longitude
  }, function(err) {
    // error
  });


var watchOptions = {
  frequency : 1000,
  timeout : 3000,
  enableHighAccuracy: false // may cause errors if true
};

var watch = $cordovaGeolocation.watchPosition(watchOptions);
watch.then(
  null,
  function(err) {
    // error
  },
  function(position) {
    var lat  = position.coords.latitude
    var long = position.coords.longitude
    geoLocation.setGeolocation(lat, long);
    geoLocation.setStations(function(stations) {
      $scope.lista = stations.data;
    })
    watch.clearWatch();
});







  $scope.distance = function(lat2, lon2) {
    var pos = geoLocation.getGeolocation();
    var lat1 = pos.lat;
    var lon1 = pos.lng;
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
  }

  $scope.accion = function(id) {
    console.log(id);
    $http.get('http://unuko.com:7777/gas/' + id)
    .then(function(station) {
      console.log('success', station);
      $state.go('tabs.detalle');
      console.log('debería haber redireccionado')
    }, function(err) {
      console.error('ERR', err);
    })
  }

  $scope.prueba = function() {
    var pos = geoLocation.getGeolocation();
    $http.get('http://unuko.com:7777/gas?lat=' + pos.lat + '&lon=' + pos.lng)
      .then(function(stations) {
        console.log('success', stations);
        listaService.model.lista = stations.data;
        listaService.SaveState();
        $scope.lista = listaService.model.lista;
        //$state.go('lista.detalle')
      }, function(err) {
        console.log('ERR', err);
      });
  }

  $scope.obtenerDetalle = function(id) {
    console.log('state', $state)
    console.log('id', id)
    $http.get('http://unuko.com:7777/gas/' + $state.params.id)
    .then(function(station) {
      console.log('success', station);

      $scope.station = station.data;
      console.log('Station...', $scope.station);
    }, function(err) {
      console.error('ERR', err);
    })


  }

  $scope.init = function(id) {

    //geoLocation.setStations($scope);
    //$scope.lista = geoLocation.getStations().data;
    //$state.go('/tabs/homes')
  }

  $scope.getStations = function() {
    console.log('getStations')
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      console.log('success', position);
      console.log('http://unuko.com:7777/gas?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude)
      $http.get('http://unuko.com:7777/gas?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude)
      .then(function(stations) {
        console.log('success', stations);
        listaService.model.lista = stations.data;
        listaService.SaveState();
        $scope.lista = listaService.model.lista;
      }, function(err) {
        console.log('ERR', err);
      });
    }, function(err) {
      console.error('ERR', err);
    });

  }

  $scope.getStation = function() {
    console.log('getStation')
    $http.get('http://unuko.com:7777/gas/554b8a9ccc7214895b617dde')
    .then(function(station) {
      console.log('success', station);
    }, function(err) {
      console.error('ERR', err);
    })
  }

  //console.log($scope.dist(37.345021, -4.93425, 37.345028, -5.93425))
});
