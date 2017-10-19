/**
 * Created by jerome on 15/12/15.
 * general http Services binds to the MainView
 */

function HttpServices() {

    this.loadLocalJson = function($http, $rootScope) { // pour récupérer les infos de chaque étape en chargeant le fichier Json
            //console.log("loadLocalJson");

        var method = 'GET';

       var url = 'data/data_circuit.json';

        return $http({
                method: method,
                url: url,
                params: {},
                cache : false}).
            then(function(successResponse) { // if data successfull loaded

                $rootScope.status = successResponse.status; // save data response in the $scope
                //console.log(successResponse.data);
                        $rootScope.dataEtape = successResponse.data;
            }, function(errorResponse) { // if error when loaded
                $rootScope.emptyHttpResponse=true;
                $rootScope.httpResponseStatus="problème de chargement des données";
                $rootScope.status = errorResponse.status; // show error status
            });
    };

  this.loadLocalGeoJson = function($http, $rootScope) { // pour récupérer les infos de chaque étape en chargeant le fichier Json
    //console.log("loadLocalGeoJson");

    var method = 'GET';

    var url = 'data/itineraire.geojson';

    return $http({
      method: method,
      url: url,
      params: {},
        cache : false}).
    then(function(successResponse) { // if data successfull loaded

      $rootScope.status = successResponse.status; // save data response in the $scope
      //console.log(successResponse.data);
      $rootScope.itineraire = successResponse.data;
    }, function(errorResponse) { // if error when loaded
      $rootScope.emptyHttpResponse=true;
      $rootScope.httpResponseStatus="problème de chargement des données";
      $rootScope.status = errorResponse.status; // show error status
    });
  };

/*
  this.loadLocalMap = function($http, $rootScope) {
    //console.log("loadLocalMap");

    var method = 'GET';

    var url = 'data/map.xml';

    return $http({
      method: method,
      url: url,
      params: {},
      cache : false}).
    then(function(successResponse) { // if data successfull loaded

      $rootScope.status = successResponse.status; // save data response in the $scope
      //console.log(successResponse.data);
      $rootScope.dataMap = successResponse.data;
    }, function(errorResponse) { // if error when loaded
      $rootScope.emptyHttpResponse=true;
      $rootScope.httpResponseStatus="problème de chargement des données";
      $rootScope.status = errorResponse.status; // show error status
    });
  };
  */

  // test des connexions réseau actives

  this.checkNetworkConnection = function() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    // alert('Connection type: ' + states[networkState]);
    return networkState != Connection.NONE;
  };

  this.checkInternetConnection = function() {
    return window.navigator.connection.type !== Connection.NONE;
  }

}
