
function MainCtrl($rootScope, $scope, $http, $q, $ionicModal, httpServices, dataBaseService) {

  // chaque $scope est différent pour chaque Controller
  // si on veut utiliser e même dans l'appli, il faut utiliser le même controler dans les vues
  //Sinon, utiliser le $rootScope qui est le même dans toutes les vues avec des diférents controller

  $scope.showSelectTypeParcours=false; // choix du type de parcours, pas affiché tant que les données initiales n'ont pas été chargées en BD
  $scope.showValidButton = false;

  $scope.$on('$ionicView.loaded', function(e) {
    $rootScope.contentHeight = window.innerHeight;
    $rootScope.contentWidth = window.innerWidth;
    //console.log("contentHeight : "+ $scope.contentHeight + " / " + "contentWidth : "+ $scope.contentWidth);
    $rootScope.contentWidth680 = $rootScope.contentWidth >= 680; // utilisé pour mis en page des modales
    $rootScope.isIos=ionic.Platform.isIOS(); // utilisé pour mis en page spécifique à Ios

    var promise = dataBaseService.createDatabase($q)// création de la base de donnée et chargement des données initiales si elles n'existent pas
      .then(function(successResponse) { // when data loaded
        if (successResponse==true) {
          dataBaseService.testDataBaseEmpty($q)// test si la bd est vide, si c'est le cas, on insère les donées initiales
            .then(function(successResponse) { // when data loaded
                //console.log("promise.resultTest : " + JSON.stringify(successResponse));
                if (successResponse.resultTest==0) { // la base de donnée est vide, l'appli n'a donc jamais été chargée
                  dataBaseService.insertInitialData($q, $rootScope)
                    .then(function(successResponse) { // when data loaded
                      if (successResponse==true) {
                        dataBaseService.selectDataMainTable($q, $rootScope)
                          .then(function(successResponse) { // when data loaded
                            if (successResponse==true) {
                              $scope.showSelectTypeParcours=true;// toutes les données sont chargées, on affichera la modal de choix du parcours
                            }
                          });
                      }
                    });
                }
                else { // la base de donnée n'est pas vide
                  dataBaseService.selectDataMainTable($q, $rootScope)
                }
            });
        }
      });


//todo créer une succession de promise dans createDataBase
    var promiseLoadLocalJson = httpServices.loadLocalJson($http, $rootScope) // récupératio des données du parcours
      .then(function(successResponse) { // when data loaded
        if (!$rootScope.emptyHttpResponse) { // if there a valid response of the server
          // todo

        }

        else { // if there's no adverts in the response of the server
          // todo
        }

      }, function(errorResponse) { // if data not loaded
        // todo
      });

  });

  $scope.$on('$ionicView.enter', function(e) {
    //console.log("hello");
 //   dataBaseService.selectDataMainTable($rootScope); // récupération des données utilisateur (étape en cours et score)
  });

  $scope.$on('$ionicView.afterEnter', function() {
    $scope.stopAudio();
  });

  $scope.updateTypeParcours = function() { // use to update the type of parcours after the user selected it in home page
    //console.log("updateTypeParcours : " + $rootScope.type_parcours);
    dataBaseService.updateDataMainTable($q, $rootScope);
    $scope.showValidButton = true;
  };

$scope.selectParcours = function() {
  //console.log("selectParcours");
    $scope.openModal();
};
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
    $scope.showSelectTypeParcours=false;
    $scope.selectTypeParcours.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.selectTypeParcours.remove();
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
