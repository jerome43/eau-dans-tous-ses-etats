function ParametresCtrl($rootScope, $q, $scope, $ionicModal, $ionicLoading, $ionicHistory, $state, dataBaseService) {
  $rootScope.type_parcours_temp="M";
  $scope.showValidButton = false;

  $scope.$on('$ionicView.enter', function(e) {
    //console.log('$ionicView.enter');
  });

  $scope.$on('$ionicView.afterEnter', function() {
    $scope.stopAudio();
  });

  $scope.resetAndUpdateTypeParcours = function() { // use to reset and update the type of parcours after the user selected it in parameter page
    $scope.closeModal();
    $rootScope.type_parcours = $scope.type_parcours_temp;
    //console.log("resetAndUpdateTypeParcours : " + $scope.type_parcours_temp);
    $rootScope.score_adulte=0;
    $rootScope.score_enfant=0;
    $rootScope.indexEtape=1;
    $rootScope.map_loaded="false";
    // todo reset DB and update the type of parcours
    var promise = dataBaseService.updateDataMainTable($q, $rootScope);
    promise.then(function(result) {
      if (result==true) {
        dataBaseService.updateAllDataSteepTableToFalse($q)
          .then( function(result) {
            if (result==true) {
              //console.log("resetSucces");
             // $rootScope.fromReset=true;
             // $ionicHistory.clearHistory();
             // $state.go('accueil');

              $ionicHistory.clearCache().then(function(){
                $rootScope.score_adulte=0;
                $rootScope.score_enfant=0;
                $rootScope.indexEtape=1;
                $rootScope.map_loaded="false";
                $state.go('accueil')});

            }

          })
        }
      });
  };

  $scope.clickIonRadio = function() {
    //console.log("clickIonRadio");
    $scope.showValidButton = true;
  };



  $scope.cachingMap = function() {
    //console.log("caching Map");
    if (checkNetworkConnection() != false || checkInternetConnection() != false) {
      navigator.notification.confirm('Confirmez le téléchargement du fond de carte (env 5 MO).\n Cela peut avoir un impact sur votre forfait.', onConfirmConfirm, "téléchargement de la carte", ["oui", "non"]);
      function onConfirmConfirm(buttonIndex) {
        //console.log("selected bouton : " + buttonIndex);
        if (buttonIndex == 1) {
          caching();
        }
        else {
          alertPerso("Téléchargement annulé ");
        }
      }
    }
    else {
      alertPerso("Pas de connection réseau.\nTéléchargement impossible.");
    }
  };

  function caching() {
    /*
    var lat1 = $rootScope.dataEtape.etape[1].geolocation[0];
    var lng1 = $rootScope.dataEtape.etape[1].geolocation[1];
    var lat2 = $rootScope.dataEtape.etape[11].geolocation[0];
    var lng2 = $rootScope.dataEtape.etape[11].geolocation[1];
    var zmin = 14;
    var zmax = 18;
    */
 //   var tile_list = $rootScope.BASE.calculateXYZListFromPyramid(lat1, lng1, zmin, zmax);
 //   var tile_list = $rootScope.BASE.calculateXYZListFromBoundsPerso(43.611371, 2.663533, 43.595242, 2.709109, zmin, zmax);
    var tile_list = $rootScope.BASE.calculateXYZListFromBoundsPerso(43.607504, 2.670373, 43.597574, 2.708535, 17, 17);


    $rootScope.BASE.downloadXYZList(
      // 1st param: a list of XYZ objects indicating tiles to download
      tile_list,
      // 2nd param: overwrite existing tiles on disk? if no then a tile already on disk will be kept, which can be a big time saver
      false,
      // 3rd param: progress callback
      // receives the number of tiles downloaded and the number of tiles total; caller can calculate a percentage, update progress bar, etc.
      function (done,total) {
        var percent = Math.round(100 * done / total);
        //console.log(done  + " / " + total + " = " + percent + "%");
        $ionicLoading.show({
          template: "<div><p>Téléchargement en cours : " + percent + "%</p><img class='page-loader' src='img/loader.gif'/></div>"
        });
      },
      // 4th param: complete callback
      // no parameters are given, but we know we're done!
      function () {
        // for this demo, on success we use another L.TileLayer.Cordova feature and show the disk usage
        //testUsage();
        $rootScope.map_loaded="true"; // on indique que la carte a été téléchargée
        dataBaseService.updateDataMainTable($q, $rootScope); // et on sauvagarde l'ifo en base de données
        $ionicLoading.hide();
        $state.go('tabs.geoloc');
        alertPerso('Téléchargement terminé !');

      },
      // 5th param: error callback
      // parameter is the error message string
      function (error) {
        //console.log("Failed\nError code: " + error.code);
        $ionicLoading.hide();
        alertPerso('Téléchargement impossible\nVérifiez votre connexion Internet !');
      }
    );
  }


  // test des connexions réseau actives

  function checkNetworkConnection() {
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
  }

  function checkInternetConnection() {
    return window.navigator.connection.type !== Connection.NONE;

  }

  // ALERTES

  function alertPerso(message) {
    navigator.notification.alert (message, alertCallback, 'Information', 'Ok');
  }

  function alertCallback() {
  }


  // Chargement, ouverture et fermeture de la modalde choix du type de parcours
  $ionicModal.fromTemplateUrl('selectTypeParcours.html', {
    id:1,
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.selectTypeParcours = modal;
  });
  $scope.openModal = function(index) {
      $scope.selectTypeParcours.show();
  };
  $scope.closeModal = function(index) {
      $scope.selectTypeParcours.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
   // $scope.selectTypeParcours.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function(event, modal) {
    //console.log("modal " + modal.id + " hidden");
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function(event, modal) {
    // Execute action
    //console.log("modal " + modal.id + " removed");
  });


  // to stop the audio playing
  $scope.stopAudio = function() {
    if ($rootScope.audio) {
      $rootScope.audio.pause();
    }
  };

}
