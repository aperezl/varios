// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    console.log('inicio')
  });
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

.controller('mainCtrl', function($scope, $rootScope, listaService, $http, $cordovaGeolocation) {
  console.log('iniciado el controlador');




  $scope.dist = function(lat1, lat2, lon1, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI/180);
    }
    var R = 6371;
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) +
      Math.sin(dLon/2) * Math.sin(dLon/2);

    //var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    //var d = R * c;

    console.log('Math.sqrt(a)', Math.sqrt(a));
    console.log('Math.asin(x)', Math.asin(a));
    //return d;

    return R * 2 * Math.asin(Math.sqrt(a));
  }

  $scope.accion = function(a) {
    console.log(a);
  }

  $scope.prueba = function() {
    alert('esto es una prueba');
  }

  $scope.getStations = function() {
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

  console.log($scope.dist(37.345021, -4.93425, 37.345028, -5.93425))
});
