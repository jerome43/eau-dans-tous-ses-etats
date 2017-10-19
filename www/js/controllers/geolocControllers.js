/**
 * Created by jerome on 14/12/15.
 * general map services bind to mapController
 */

function GeolocCtrl($rootScope, $scope, $http, dataBaseService, $q, $state, $ionicLoading, $location, $timeout, $document, httpServices, leafletData, leafletMarkerEvents) {

// var BASE; // fond de carte
  var watchId; // position GPS de l'utilisateur
  var marker_position=null; // position de l'utilisateur sur la care


  // default center of the map
  $scope.center = {
    lat: $rootScope.dataEtape.etape[$rootScope.indexEtape].geolocation[0],
    lng: $rootScope.dataEtape.etape[$rootScope.indexEtape].geolocation[1],
    zoom: 14
  };

  // default set of the map
  $scope.defaults = {
  //  tileLayer : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    keyboard: true,
    dragging: true,
    worldCopyJump: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    tap: false,
    touchZoom: true,
    zoomControl: false,
    minZoom:13,
    maxZoom:17,
    attributionControl: false
  };


  $scope.$on('$ionicView.loaded', function(e) {
    //console.log('$ionicView.loaded');

    $scope.mapConnected = { // si la map est en mode connecté ou déconnecté (usage des fichiers téléchargés)
      value : true
    };
    $scope.online="Connecté"; // si la map est en mode connecté ou déconnecté : message affiché à l'utilisateur

    $scope.enableLocateMe = {
      value : "false"
    }; // indique si l'utilisateur a lançé le GPS

    // test si connexion réseau disponible et message utilisateur en fonction
    if ((httpServices.checkNetworkConnection() == false || httpServices.checkInternetConnection() == false) && $scope.mapConnected.value==true) {
      if ($rootScope.map_loaded=="false") {
        alertPerso("pas de réseau disponible, chargement de la carte impossible");
      }
      else {alertPerso("Vous devriez passer en mode offline")}
    }

    if ((httpServices.checkNetworkConnection() != false || httpServices.checkInternetConnection() != false) && $rootScope.map_loaded=="false") {
      navigator.notification.confirm ('Voulez-vous télécharger le fond de carte (environ 5 MO). Cela vous permettra d\'utiliser la carte en mode non connecté.', onConfirmConfirm, "téléchargement de la carte", ["oui","non"]) ;
      function onConfirmConfirm(buttonIndex) {
        //console.log("selected bouton : " + buttonIndex);
        if (buttonIndex==1) {
          testCaching('bounds');
         // testCaching('pyramid');
        }
        else {
          navigator.notification.alert("Vous pourrez à tout moment télécharger la carte dans l'onglet paramètres", onConfirmAlert, "information");
          function onConfirmAlert() {}
        }
      }
    }


    // to get the map object created by leaflet directive
    leafletData.getMap('map').then(function(map) {
      // set it uo $scope to use later
      $scope.map = map;
      // create the map tile layer with the cordova plugin to save it in filesystem
      startMap();
      loadMarkers();
      loadKml();
      // dialogue pour demander le téléchargement de la carte
      //if (!$rootScope.mapFileAskedCache) {
      //  $rootScope.mapFileAskedCache=true;

    });
   // $scope.enableLocateMe=true;
  });


  $scope.$on('$ionicView.enter', function(e) {
    //console.log('$ionicView.enter');
    /*
    if ($rootScope.map_loaded=="true") {
      $scope.online="offline";
      $scope.mapConnected.value=false;
     $rootScope.BASE.goOffline();
    }
    */

      var promise = dataBaseService.selectDataSteepTableVisited($q, $rootScope)
        .then(function(successResponse) { // when data loaded
          if (successResponse==true) {
            sizeMinusMarkers(); // on remet tous les markers en petite taille
            updateMarkers();
            panToIndexEtape();
            /*
             if (!$rootScope.fromReset) {
             $rootScope.fromReset=false;
             panToIndexEtape();
             }
             */
            $scope.infoEtapeContent = $rootScope.dataEtape.etape[$rootScope.indexEtape].titre; // MAJ du contenu de la boite d'info
          }

        }, function(errorResponse) { // if data not loaded
        });
  });

  $scope.$on('$ionicView.afterEnter', function() {
    // rajouté pour empêcher le bug provoqué par la modal de ionic qui casse la carte une fois qu'on a affiché la modale
    // see https://github.com/driftyco/ionic/issues/3233
    ionic.trigger('resize');
    $scope.stopAudio();
   // console.log("max zoom : " + $scope.map.getMaxZoom());
  });

  //to create the tile layer with the cordova plugin for save it later in filesystem
  function startMap() {
    try {
      $rootScope.BASE = L.tileLayerCordova('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.9,
        detectRetina: true,
        reuseTiles: true,
        // these are specific to L.TileLayer.Cordova and mostly specify where to store the tiles on disk
        //folder: 'LTileLayerCordovaExample',
        //name:   'example',
        folder: 'cpiehlapp',
        name:   'terrain',
        debug:   true
      }, function() {
        // ad the tile Layer to the map
        $rootScope.BASE.addTo($scope.map);
      });

    } catch (e) {
      alert(e);
    }
  }

  // to load the markers of each steep geolocated in the map
  function loadMarkers() {

    //console.log('load markers étape');
    // $scope.infowindows_steep_array = [];
    $scope.marker_steep_array = [];
    if ($rootScope.dataEtape.etape) {
      for (var i=1; i<$rootScope.dataEtape.etape.length; i++) {

        // prepare marker option
        var mkSteepIcon = {
          // attention to keep a iconSize and iconAnchor defined here otherwide markers move when zoom on map (bug)
          iconUrl: 'img/icon/1X/ic_place_black_'+String(i)+'.png',
          shadowUrl: 'img/icon/1X/ic_place_ombre_48dp.png',
          iconSize:     [48, 48], // size of the icon
          shadowSize:   [48, 48], // size of the shadow
         // iconAnchor:   [24, 48], // point of the icon which will correspond to marker's location
          iconAnchor:   [24,44], // point of the icon which will correspond to marker's location
          shadowAnchor: [24,44],  // the same for the shadow
          popupAnchor:  [0, -52] // point from which the popup should open relative to the iconAnchor
        };

        var mkSteepLat = $rootScope.dataEtape.etape[i].geolocation[0]; // Lat of a steep marker
        var mkSteepLng = $rootScope.dataEtape.etape[i].geolocation[1]; // Lng of a steep marker
        var mkSteepTitre=$rootScope.dataEtape.etape[i].titre; // the title of the steep displayed by marker


        // create object representing marker of each steep
        // set a id to marker to manipulate later
        $scope.marker_steep_array[$rootScope.dataEtape.etape[i].id] = {
          lat: mkSteepLat, title: mkSteepTitre,
          lng: mkSteepLng, icon: mkSteepIcon,
          zIndexOffset : 1000-50*i,
          id : i
        }; // save the marker in a Array to manipulate it later
      }
      $scope.markers = $scope.marker_steep_array;

    }
    else {
      //console.log("$rootScope.dataEtape.etape undefined")
    }
  }

  function updateMarkers() {
    //console.log('updateMarkers');
    for (var id in $scope.marker_steep_array) {
      if ($scope.marker_steep_array.hasOwnProperty(id)) {
        //console.log("array id : " + id + " visited : " + $rootScope.dataEtape.etape[id].visited);
        if (id==$rootScope.indexEtape) {
          $scope.marker_steep_array[id].icon.iconUrl = 'img/icon/1X/ic_place_blue_'+String(id)+'.png'; // puts the marker on the map
          $scope.marker_steep_array[id].zIndexOffset = 1000;
        }
        else {
          //console.log("array id : " + id + " visited : " + $rootScope.dataEtape.etape[id].visited);
          if ($rootScope.dataEtape.etape[id].visited=="true") {
            //console.log('true');
            $scope.marker_steep_array[id].icon.iconUrl = 'img/icon/1X/ic_place_gray_'+String(id)+'.png'; // puts the marker on the map
          }
          else {
            $scope.marker_steep_array[id].icon.iconUrl = 'img/icon/1X/ic_place_black_'+String(id)+'.png'; // puts the marker on the map
          }
        }
      }

    }
  }

  // to make marker bigger when clik
  function sizeMaximusMarkers(idMarker) {
    //console.log('animateMarkers');
    for (var id in $scope.marker_steep_array) {
      if (id==idMarker) {
        if ($scope.marker_steep_array.hasOwnProperty(id)) {
          $scope.marker_steep_array[id].icon.iconSize = [64,64];
          $scope.marker_steep_array[id].icon.shadowSize = [64,64];
          $scope.marker_steep_array[id].icon.iconAnchor = [32,59];
          $scope.marker_steep_array[id].icon.shadowAnchor = [32,59];
          $scope.marker_steep_array[id].icon.popupAnchor = [0,-68];
          $scope.marker_steep_array[id].zIndexOffset = 1000;
        }
      }
    }
  }

  // make marker smaller when clik
  function sizeMinusMarkers() {
    //console.log('animateMarkers');
    for (var id in $scope.marker_steep_array) {
      if ($scope.marker_steep_array.hasOwnProperty(id)) {
        $scope.marker_steep_array[id].icon.iconSize = [48,48];
        $scope.marker_steep_array[id].icon.shadowSize = [48,48];
        $scope.marker_steep_array[id].icon.iconAnchor = [24,44];
        $scope.marker_steep_array[id].icon.shadowAnchor = [24,44];
        $scope.marker_steep_array[id].icon.popupAnchor = [0,-52];
        $scope.marker_steep_array[id].zIndexOffset = 1000-50*id;
      }
    }
  }

  function panToIndexEtape() {
    //console.log('panToIndexEtape');
    $scope.map.panTo([$rootScope.dataEtape.etape[$rootScope.indexEtape].geolocation[0], $rootScope.dataEtape.etape[$rootScope.indexEtape].geolocation[1]]);
  }


   var markerEvents = leafletMarkerEvents.getAvailableEvents();
   for (var k in markerEvents) {
   var eventMarkerName = 'leafletDirectiveMarker.map.' + markerEvents[k];
   $scope.$on(eventMarkerName, function(event, arg){
     //console.log("clickMarker event");
    // for (var i in arg.leafletObject) {
    //   for (var i in event.targetScope.markers) {
    //     for (var i in event.name) {
    //   console.log("$scope.infoEtapeContent : " + i.toString());
    // }

     $scope.infoEtapeContent = arg.leafletObject.options.title;
     sizeMinusMarkers();
     sizeMaximusMarkers(arg.leafletObject.options.id);
     //console.log("$scope.infoEtapeContent : " + $scope.infoEtapeContent);

     // fonction pour effet d'apparition progressive du texte
     /*
     // todo code à reprendre si utilisée car génère un bug lors de la réinitialisation : cacheInfoEtapeContainer null
       $timeout.cancel($scope.timeOutAnimation);
       var cacheInfoEtapeContainer = $document[0].getElementById("cacheInfoEtapeContainer");
       cacheInfoEtapeContainer.style.display = "block";
       cacheInfoEtapeContainer.style.webkitAnimationName = "animationMenu";
       cacheInfoEtapeContainer.style.webkitAnimationDuration = "3s";
       $scope.timeOutAnimation = $timeout(function(){cacheInfoEtapeContainer.style.display = "none";}, 3000);
       */


     $rootScope.indexEtape = arg.leafletObject.options.id;
     if ($rootScope.type_parcours=="M" || $rootScope.type_parcours=="A") {
       //$state.go('tabs.etapeadulte'); // ne pas utiliser car il ne met pas à jour le titre
       $location.url("/tabs/etapeadulte");
     }
     else {
      // $state.go('tabs.etapeenfant'); // ne pas utiliser car il ne met pas à jour le titre
       $location.url("/tabs/etapeenfant");
     }


   });
   }


  /*
  var mapEvents = leafletMapEvents.getAvailableMapEvents();
  for (var k in mapEvents) {
    var eventMapName = 'leafletDirectiveMap.map.' + mapEvents[k];
    $scope.$on(eventMapName, function(event){
      //console.log("clickMap event");
      //   $scope.infoEtapeContent = event.name + " / " + event.target;
      //   console.log("$scope.infoEtapeContent : " + $scope.infoEtapeContent);
    });
  }
  */

$scope.clickGoToSteep = function() {
  //console.log('clickGoToSteep');
    for (var index= 1; index<$rootScope.dataEtape.etape.length; index++) {
      //console.log($rootScope.dataEtape.etape[index].titre + " / " + $scope.infoEtapeContent);
      if ($rootScope.dataEtape.etape[index].titre == $scope.infoEtapeContent) {
        //console.log('test ok');
        $rootScope.indexEtape = index;
        if ($rootScope.type_parcours=="M" || $rootScope.type_parcours=="A") {
          $state.go('tabs.etapeadulte');
        }
        else {
          $state.go('tabs.etapeenfant');
        }
        break;
      }
    }
  };

  /*

  $scope.onSwipeRight = function() {
    alert('onSwipeRight')
  };
  $scope.onSwipeLeft = function() {
    //console.log('onSwipeLeft')
  };
  */


  $scope.locateMe = function() {
    //console.log("locateMe");
   // $scope.enableLocateMe=false;
    $scope.map.off('locationerror');
    $scope.map.off('locationfound');
    $scope.map.locate({watch: true, setView: true, maxZoom: 17, timeout:60000, enableHighAccuracy : true});
   // $scope.map.locate({watch: true, setView: true, timeout:60000, enableHighAccuracy : true});
    $scope.map.on('locationfound', onLocationFound);
    $scope.map.on('locationerror', onLocationError);
  };

  $scope.stopLocateMe = function() {
    //console.log("stopLocate");
   // $scope.enableLocateMe=true;
    navigator.geolocation.clearWatch(watchId);
    // to get the user location
    $scope.map.stopLocate();
    $scope.map.off('locationfound');
    $scope.map.off('locationerror');
    if(marker_position!=null) {
      $scope.map.removeLayer(marker_position); // enlever d'abord les précédentes positions car onLocationFound est appelé plusieurs fois
    }
  };

  $scope.locateMeOrNot = function() {
    //console.log("locateMeOrNot : " + $scope.enableLocateMe.value);
    if ($scope.enableLocateMe.value=="true") {
      $scope.locateMe();
    }
    else {
      panToIndexEtape();
      $scope.stopLocateMe();
    }
  };


  function onLocationFound(e) {
    //console.log("onLocationFound");
    watchId = navigator.geolocation.watchPosition(updatePosition);
    // alert(e.message);
    if(marker_position!=null) {
        $scope.map.removeLayer(marker_position); // enlever d'abord les précédentes positions car onLocationFound est appelé plusieurs fois
    }
  //  marker_position = L.circleMarker(e.latlng, e.accuracy/2, {fill: true, opacity : 1, fillOpacity:0.2}); // to make a circle wich size depend of the accuracy
    marker_position = L.circleMarker(e.latlng, 25, {fill: true, opacity : 1, fillOpacity:0.2});
    $scope.map.addLayer(marker_position);
    marker_position.zIndexOffset=9999;
  }


  function onLocationError(e) {
    // alert(e.message);
   // $scope.enableLocateMe=true;
    $scope.map.off('locationfound');
    $scope.map.off('locationerror');
    $scope.enableLocateMe.value="false";
    alertPerso("Impossible de déterminer votre position. Veuillez activer votre GPS (ou votre connexion de données) puis relancez le service de géolocalisation");
  }


  function updatePosition(position) {
    marker_position.setLatLng([position.coords.latitude, position.coords.longitude]);
    //marker_position.setRadius(position.coords.accuracy/2); // if marker size depend of the accuracy
  }


// pour précharger la carte et la mettre en cache dans le système de fichier

  // utile pour débuggage

  $scope.testOffline = function() {
    //console.log('testOffline');
    $rootScope.BASE.goOffline();
    updateStatus();
  };
  $scope.testOnline = function() {
    $rootScope.BASE.goOnline();
    updateStatus();
  };
  $scope.testUsage = function() {
    var status_block = document.getElementById('status');
    $rootScope.BASE.getDiskUsage(function (filecount,bytes) {
      var kilobytes = Math.round( bytes / 1024 );
      alert("Cache status" + "<br/>" + filecount + " files" + "<br/>" + kilobytes + " kB");
    });
  };
  $scope.testBrowseCache = function() {
    $rootScope.BASE.getCacheContents(function(cache) {
      //console.log(cache);
      alert("Look in console for cache contents");
    });
  };
  $scope.testEmpty = function() {
    $rootScope.BASE.emptyCache(function (oks,fails) {
      var message = "Cleared cache.\n" + oks + " deleted OK\n" + fails + " failed";
      alert(message);
      testUsage();
    })
    };


  function testCaching(which) {
  //  var lat       = $scope.map.getCenter().lat;
  //  var lng       = $scope.map.getCenter().lng;
  //  var zmin      = 17;
  //  var zmax      = 17;
    //var tile_list = (which == 'pyramid' ? $rootScope.BASE.calculateXYZListFromPyramid(lat, lng, zmin, zmax) : $rootScope.BASE.calculateXYZListFromBounds($scope.map.getBounds(), zmin, zmax));
    //var tile_list = $rootScope.BASE.calculateXYZListFromBoundsPerso(43.611371, 2.663533, 43.595242, 2.709109, zmin, zmax);
    var tile_list = $rootScope.BASE.calculateXYZListFromBoundsPerso(43.607504, 2.670373, 43.597574, 2.708535, 17, 17);
  //  var message   = "Preparing to cache tiles.\n" + "Zoom level " + zmin + " through " + zmax + "\n" + tile_list.length + " tiles total." + "\nClick OK to proceed.";
  //  var ok        = confirm(message);
  //  if (! ok) return false;

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
        $scope.showSpinner(percent);
      },
      // 4th param: complete callback
      // no parameters are given, but we know we're done!
      function () {
        // for this demo, on success we use another L.TileLayer.Cordova feature and show the disk usage
        //testUsage();
        $rootScope.map_loaded="true"; // on indique que la carte a été téléchargée
        $scope.online="Déconnecté";// on passe en mode déconnecté
        $scope.mapConnected.value=false;// on passe en mode déconnecté
        $rootScope.BASE.goOffline(); // on passe en mode déconnecté
        $scope.map.setZoom(16);
        $scope.map.setMinZoom(16);
        $scope.map.setMaxZoom(16);
        dataBaseService.updateDataMainTable($q, $rootScope); // et on sauvagarde l'info en base de données
        $scope.hideSpinner();
        alertPerso('Téléchargement terminé !');

      },
      // 5th param: error callback
      // parameter is the error message string
      function (error) {
       //console.log("Failed\nError code: " + error.code);
        $scope.hideSpinner();
        alertPerso('Téléchargement impossible\nVérifiez votre connexion Internet !');
      }
    );
  }

  function updateStatus() {
    // alert(map.getCenter().lat.toFixed(5) + ' x ' + map.getCenter().lng.toFixed(5) + ' @ ' + map.getZoom() + ($rootScope.BASE.isOnline() ? ' (ONLINE)' : $rootScope.BASE.isOffline() ? ' (OFFLINE)' : ''));
  }


  function loadKml() { // to load the kml itineraire data info
    //console.log('load kml');
    var promiseLoadLocalJson = httpServices.loadLocalGeoJson($http, $rootScope) // récupératio des données du parcours
      .then(function(successResponse) { // when data loaded
        if (!$rootScope.emptyHttpResponse) { // if there a valid response of the server
          L.geoJson($rootScope.itineraire).addTo($scope.map);
          $scope.map.fitBounds(L.geoJson($rootScope.itineraire).getBounds());// ajustement de la carte pour contenir le parcours
      //    $scope.map.options.maxZoom=18;
          /*
       for (var i in L.geoJson($rootScope.itineraire).getBounds()) {
         //console.log("map bounds : " +  i);
       }
       */
        }
        else { // if there's no adverts in the response of the server
        }
      }, function(errorResponse) { // if data not loaded
      });
  }


  $scope.showSpinner = function(percent) {
    $ionicLoading.show({
    //  template: '<div><ion-spinner icon="lines" class="spinner-positive"></ion-spinner></div>'
    //  template: "<div><img class='page-loader' src='img/loader.gif'/></div>"
      template: "<div><p>Téléchargement en cours : " + percent + "%</p><img class='page-loader' src='img/loader.gif'/></div>"
      //  template: "<div><ion-spinner icon='lines' class='spinner-positive'></ion-spinner><span>" + percent + "%</span></div>"
    });
  };
  $scope.hideSpinner = function(){
    $ionicLoading.hide();
  };

  // pour se mettre en mode carte déconnexté ou non en fonction du bouton toogle
  $scope.goOnOrOffLine = function() {
    if ($scope.mapConnected.value) {
      //console.log('goOnline');
      if (httpServices.checkNetworkConnection() == false || httpServices.checkInternetConnection() == false) {
        $scope.online="Déconnecté";
        $scope.mapConnected.value=false;
        alertPerso('Pas de connexion réseau disponible\nVérifiez vos paramètres');
    }
      else {
        $rootScope.BASE.goOnline();
        $scope.online="Connecté";
        $scope.map.setMinZoom(13);
        $scope.map.setMaxZoom(17);
      }

    }
    else {
      //console.log('goOffline');
      $rootScope.BASE.goOffline();
      $scope.online="Déconnecté";
      $scope.map.setZoom(16);
      $scope.map.setMinZoom(16);
      $scope.map.setMaxZoom(16);
    }
  };

/*
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
  */

  // ALERTES

  function alertPerso(message) {
    navigator.notification.alert (message, alertCallback, 'Information', 'Ok');
  }

  function alertCallback() {
  }

  // to stop the audio playing
  $scope.stopAudio = function() {
    if ($rootScope.audio) {
      $rootScope.audio.pause();
    }
  };

}
