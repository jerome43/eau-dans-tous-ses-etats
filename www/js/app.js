// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in app.js


angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in mainControllers.js
  $stateProvider

  // setup an abstract state for the tabs directive

    .state('tabs', {
    url: '/tabs',
    abstract: true,
    templateUrl: 'templates/tabs.html',
      controller: 'TabsCtrl'
  })


  // Each tab has its own nav history stack:

  .state('tabs.etapeadulte', {
      url: '/etapeadulte',
      views: {
        'tabs-etapeadulte': {// use the same name as in tabs.html file
          templateUrl: 'templates/etape-adulte.html',
          controller: 'EtapeCtrl'
        }
      }
    })

    .state('tabs.etapeenfant', {
      url: '/etapeenfant',
      views: {
        'tabs-etapeenfant': {// use the same name as in tabs.html file
          templateUrl: 'templates/etape-enfant.html',
          controller: 'EtapeCtrl'
        }
      }
    })

    .state('tabs.geoloc', {
    url: '/geoloc',
    views: {
      'tabs-geoloc': { // use the same name as in tabs.html file
        templateUrl: 'templates/geoloc.html',
        controller: 'GeolocCtrl'
      }
    }
  })

  .state('accueil', {
      url: '/accueil',
      templateUrl: 'templates/accueil.html',
      controller: 'MainCtrl'
    })

  .state('partenaires', {
    url: '/partenaires',
        templateUrl: 'templates/partenaires.html',
        controller: 'MainCtrl'
  })

  .state('credits', {
    url: '/credits',
        templateUrl: 'templates/credits.html',
        controller: 'MainCtrl'
  })

  .state('parametres', {
    url: '/parametres',
    templateUrl: 'templates/parametres.html',
    controller: 'ParametresCtrl'
  })

    .state('finishModal', {
      url: '/finishModal',
      templateUrl: 'templates/finishModal.html',
      controller: 'EtapeCtrl'
    })
  ;


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/accueil');

  // to set tabs on top for android et ios
  $ionicConfigProvider.tabs.position("top");
  $ionicConfigProvider.scrolling.jsScrolling(true); // pour rendre visible la barre de scroll même sur Android
});

angular.module('starter.controllers', [
  'myApp.directive3',
  'myApp.directive3e',
  'myApp.directive4e',
  'myApp.directive5',
  'myApp.directive5e',
  'myApp.directive6',
  'myApp.directive7',
  'myApp.directive7e',
  'myApp.directive8',
  'myApp.directive8e',
  'myApp.directive11',
  'myApp.directive11e',
  //'myApp.directive-get-width',
  //'myApp.directive-get-width-e',
  'leaflet-directive'])

  .controller('MainCtrl', MainCtrl)
  .controller('ParametresCtrl', ParametresCtrl)
  .controller('GeolocCtrl', GeolocCtrl)
  .controller('EtapeCtrl', EtapeCtrl)
  .controller('TabsCtrl', TabsCtrl)
  .service("httpServices", HttpServices)
  .service("dataBaseService", DataBaseService)
  .filter('unsafe', function($sce) { return $sce.trustAsHtml;}); // pour pouvoir retourner du javascript dans du contenu html bindé

