
function EtapeCtrl($rootScope, $scope, $ionicModal, $document, $timeout, dataBaseService, httpServices, $q, $location, $ionicScrollDelegate) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:

  $scope.$on('$ionicView.loaded', function(e) {
    /*
    if ($rootScope.dataEtape.etape[$rootScope.indexEtape].game) {
      //console.log(" $location.url('/game')");
      $location.url("/game");
    }
    */

   // $scope.ratio=700/($document[0].getElementsByTagName("body")[0].clientWidth*0.95); // utilisé pour le jeu paysage
    $scope.ratio=700/($rootScope.contentWidth*0.95); // utilisé pour le jeu paysage

    $rootScope.quizMarkerPaysage=[[true, true, true], [true, true, true]]; // utilisé dans quizType=='paysage' pour afficher ou non les markers sur photo paysage en fonction de la réalisation des quiz intermédiaires, premier élément du tableau pour la modal adulte, 2ème pour la modal enfant
    $scope.win=[]; // initialisaton du tableau qui indique si le joueur a perdu ou non à chaque étape
    $scope.winMessage=[]; // initialisaton du tableau qui contient le message relatif au fait que le joueur a perdu ou non à chaque étape
    $scope.win1Message=[]; // spécificité étape 1
    $scope.win10Message=[]; // spécificité étape 10
    loadShowQuizView();

    // Chargement, ouverture et fermeture des modals de quiz enfants et adultes
    //console.log("locationUrl : " + $location.url());
    if ($location.url()=="/tabs/etapeenfant") {
      $ionicModal.fromTemplateUrl('modalChild.html', {
        id:1,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalChild = modal;
      });
    }

    else {
      $ionicModal.fromTemplateUrl('modalAdult.html', {
        id:2,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalAdult = modal;
      });
    }

    $ionicModal.fromTemplateUrl('templates/finishModal.html', {
      id:3,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalFinish = modal;
    });

    $ionicModal.fromTemplateUrl('templates/quiz-paysage-parent-modal.html', {
      id:4,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalQuizPaysageP = modal;
    });

    $ionicModal.fromTemplateUrl('templates/quiz-paysage-enfant-modal.html', {
      id:5,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalQuizPaysageE = modal;
    });

  });

  $scope.$on('$ionicView.enter', function(e) {
    // todo if needed
    // si le parcours a été réinitialisé, on recharge les éléments
    if ($rootScope.fromReset) {
      $rootScope.fromReset=false;
      $rootScope.quizMarkerPaysage=[[true, true, true], [true, true, true]]; // utilisé dans quizType=='paysage' pour afficher ou non les markers sur photo paysage en fonction de la réalisation des quiz intermédiaires
      $scope.win=[]; // initialisaton du tableau qui indique si le joueur a perdu ou non à chaque étape
      $scope.winMessage=[]; // initialisaton du tableau qui contient le message relatif au fait que le joueur a perdu ou non à chaque étape
      $scope.win1Message=[];// spécificité du point 1
      $scope.win10Message=[]; // spécificité étape 10
      $rootScope.dataEtape.etape[11].game=true;// spécificité du point 11
      $rootScope.dataEtape.etapeEnfant[11].game=true;// spécificité du point 11
      $rootScope.dataEtape.etape[11].quizType=null;// spécificité du point 11
      $rootScope.dataEtape.etapeEnfant[11].quizType=null;// spécificité du point 11
      $scope.etape10Ppart1=false; // spécificité du point 10
      $scope.etape10Epart1=false; // spécificité du point 10

      /*
      if ($rootScope.dataEtape.etape[$rootScope.indexEtape-1].game) {
        //console.log(" $location.url('/game')");
        $location.url("/game");
      }
      else {
        loadShowQuizView();
      }
      */

      loadShowQuizView();
    }
    initialisation();
   $scope.toogleSteepButton();
  });

  $scope.$on('$ionicView.afterEnter', function(e) {
    $scope.resetZoom('mainScroll');
    /*
    var promise = resetZoom();
    resetZoom().then(function(greeting) {
        //console.log('Success: ' + greeting);
        resetScroll() ; // on remet le zoom à 1
      }, function(reason) {
        //console.log('Failed: ' + reason);
      }
    );
    */
    $scope.stopAudio();

    // utilisé pour corriger un bug du canvas qui se met parfois à 0 quand on navigue par les boutons tabs
    // dû à game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //console.log("canvas length :" + $document[0].getElementsByTagName("canvas").length);
    if ($document[0].getElementsByTagName("canvas")[0]!=undefined) {
      //console.log("canvas 0 resize");
      $document[0].getElementsByTagName("canvas")[0].style.width="100%";
      $document[0].getElementsByTagName("canvas")[0].style.height="100%";
    }
    if ($document[0].getElementsByTagName("canvas")[1]!=undefined) {
      //console.log("canvas 1 resize");
      $document[0].getElementsByTagName("canvas")[1].style.width = "100%";
      $document[0].getElementsByTagName("canvas")[1].style.height = "100%";
    }
  });


  function loadShowQuizView() {
    //console.log("loadShowQuizView");
    dataBaseService.selectDataSteepTableVisited($q, $rootScope)
      .then(function(successResponse) { // when data loaded
        if (successResponse==true) {
          // todo var if visitor
          var visitor;
          if ($location.url()=="/tabs/etapeenfant") {
            visitor="child";
          }
          else {
            visitor="adult";
          }
          dataBaseService.selectDataSteepTableWin($q, $scope, visitor)
            .then(function(successResponse) { // when data loaded
              if (successResponse==true) {
                initialisation();
                // initialisation des vue d'accès au quiz,
                // selon que les quiz ont déjà été réalisés, entièrement ou partiellement
                var i=1;
                $rootScope.showQuizP = [];
                $rootScope.showQuizE = [];
                //console.log(" etapeView.loaded type parcours :" + $rootScope.type_parcours);
                while (i<=$rootScope.dataEtape.etape.length-1) {
                  if ($rootScope.type_parcours=="M") {
                    //console.log("case M");
                    switch($rootScope.dataEtape.etape[i].visited) {
                      case "true":
                        //console.log("case true");
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=false;
                        break;
                      case "false":
                        //console.log("case false");
                        $rootScope.showQuizP[i]=true;
                        $rootScope.showQuizE[i]=true;
                        break;
                      case "enfantValid":
                        //console.log("case enfantValid");
                        $rootScope.showQuizP[i]=true;
                        $rootScope.showQuizE[i]=false;
                        break;
                      case "parentValid":
                        //console.log("case parent Valid");
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=true;
                        break;
                      default:
                        $rootScope.showQuizP[i]=true;
                        $rootScope.showQuizE[i]=true;
                    }
                  }

                  else if ($rootScope.type_parcours=="A") {
                    //console.log("case A");
                    switch ($rootScope.dataEtape.etape[i].visited) {
                      case "true":
                        $rootScope.showQuizP[i] = false;
                        $rootScope.showQuizE[i] = false;
                        break;
                      case "false":
                        $rootScope.showQuizP[i] = true;
                        $rootScope.showQuizE[i] = false;
                        break;
                      case "enfantValid":
                        $rootScope.showQuizP[i] = true;
                        $rootScope.showQuizE[i] = false;
                        break;
                      case "parentValid":
                        $rootScope.showQuizP[i] = false;
                        $rootScope.showQuizE[i] = false;
                        break;
                      default:
                        $rootScope.showQuizP[i] = true;
                        $rootScope.showQuizE[i] = false;
                    }
                  }

                  else if ($rootScope.type_parcours=="E") {
                    //console.log("case E");
                    switch ($rootScope.dataEtape.etape[i].visited) {
                      case "true":
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=false;
                        break;
                      case "false":
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=true;
                        break;
                      case "enfantValid":
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=false;
                        break;
                      case "parentValid":
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=true;
                        break;
                      default:
                        $rootScope.showQuizP[i]=false;
                        $rootScope.showQuizE[i]=true;
                    }
                  }
                  i++;
                }
              }
            });
        }

      }, function(errorResponse) { // if data not loaded
        var i=1;
        $rootScope.showQuizP = [];
        $rootScope.showQuizE = [];
        while (i<$rootScope.dataEtape.etape.length) {
          $rootScope.showQuizP[i]=true;
          $rootScope.showQuizE[i]=true;
          i++;
        }
      });
  }

  function initialisation() { // réinitialisation des données par défaut à chaque nouvel écran
      $scope.showValidButton = false;
      $scope.reponseQuiz=[];
      $scope.showAudio = true;
      if ($location.url()=="/tabs/etapeenfant") {
        if ($rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="multiple") {
          for (var i= 0; i<$rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].bonnesReponses.length; i ++) {
            $scope.reponseQuiz.push(false);
          }
        }
      }
      else {
        if ($rootScope.dataEtape.etape[$rootScope.indexEtape].quizType=="multiple") {
          for (var i= 0; i<$rootScope.dataEtape.etape[$rootScope.indexEtape].bonnesReponses.length; i ++) {
            $scope.reponseQuiz.push(false);
          }
        }
      }
  }

  $scope.onSwipeRight = function() {
    //console.log('onSwipeRight');
    if ($rootScope.indexEtape>1) {
      $scope.stopAudio();
      $rootScope.indexEtape --;
      initialisation();
      $scope.resetZoom('mainScroll');
      /*
      resetZoom().then(function(greeting) {
          //console.log('Success: ' + greeting);
          resetScroll() ; // on remet le zoom à 1
        }, function(reason) {
          //console.log('Failed: ' + reason);
        }
      );
      */

      dataBaseService.updateDataMainTable($q, $rootScope);
         this.toogleSteepButton();
    }
  };

  $scope.onSwipeLeft = function() {
    //console.log('onSwipeLeft');
    if ($rootScope.indexEtape<$rootScope.dataEtape.etape.length-1) {
      $scope.stopAudio();
      $rootScope.indexEtape++;
      initialisation();
      $scope.resetZoom('mainScroll');
      /*
      resetZoom().then(function(greeting) {
          //console.log('Success: ' + greeting);
          resetScroll() ; // on remet le zoom à 1
        }, function(reason) {
          //console.log('Failed: ' + reason);
        }
      );
      */

      dataBaseService.updateDataMainTable($q, $rootScope);
        this.toogleSteepButton();
    }
  };

  $scope.onSwipeRightModal = function() {
    //console.log('onSwipeRightModal');
    if ($rootScope.indexEtape>1) {
      $scope.stopAudio();
      $rootScope.indexEtape --;
      initialisation();
      $scope.resetZoom('modalScroll');
      /*
      resetZoom().then(function(greeting) {
          //console.log('Success: ' + greeting);
          resetScroll() ; // on remet le zoom à 1
        }, function(reason) {
          //console.log('Failed: ' + reason);
        }
      );
      */

      dataBaseService.updateDataMainTable($q, $rootScope);
       this.toogleSteepButton();
    }
  };


  $scope.onSwipeLeftModal = function() {
    //console.log('onSwipeLeftModal');
    if ($rootScope.indexEtape<$rootScope.dataEtape.etape.length-1) {
      $scope.stopAudio();
      $rootScope.indexEtape ++;
      initialisation();
      $scope.resetZoom('modalScroll');
      /*
      resetZoom().then(function(greeting) {
          //console.log('Success: ' + greeting);
          resetScroll() ; // on remet le zoom à 1
        }, function(reason) {
          //console.log('Failed: ' + reason);
        }
      );
      */

      dataBaseService.updateDataMainTable($q, $rootScope);
        this.toogleSteepButton();
    }
  };


  $scope.toogleSteepButton = function() {// display or not the back and next nav button according the steep number
    //console.log('toogleSteepButton');
    if ($rootScope.indexEtape==1) {
      $scope.showBackSteepButton=false;
      $scope.showNextSteepButton=true;
    }
    else if ($rootScope.indexEtape>=$rootScope.dataEtape.etape.length-1) {
      $scope.showNextSteepButton=false;
      $scope.showBackSteepButton=true;
    }
    else {
      $scope.showNextSteepButton=true;
      $scope.showBackSteepButton=true;
    }
  };


  $scope.validSteep = function() {
    //console.log("valid steep");
    $rootScope.dataEtape.etape[$rootScope.indexEtape].visited=true;
    dataBaseService.updateDataSteepTableVisited($q, $rootScope, "true")
      .then(function(successResponse) { // when data loaded
        if (successResponse==true) {
          dataBaseService.testGameFinished($q, $rootScope)
            .then(function(successResponse) { // when data loaded
              if ($rootScope.finish==true) {
                //console.log("final");
                $scope.openModal(3);
              }
            })
        }
      });
  };

  $scope.saveReponse = function(indexReponse) {   // get the selected response of the user in quizType (but not validated)
    //console.log("saveReponse : " + indexReponse);
    $scope.stopAudio();
    if ($rootScope.dataEtape.etape[$rootScope.indexEtape].quizType=="simple" || $rootScope.dataEtape.etape[$rootScope.indexEtape].quizType=="simple10" || $rootScope.dataEtape.etape[$rootScope.indexEtape].quizType=="paysage" || $rootScope.dataEtape.etape[$rootScope.indexEtape].quizType=="quizSonore") {
      $scope.reponseQuiz[0]=indexReponse; // save the reponse
      //console.log("saveReponse true ");
    }
    $scope.showValidButton=true;      // then we can display the valid button
  };

  $scope.saveReponseE = function(indexReponse) {   // get the selected response of the user in quizType (but not validated)
    //console.log("saveReponseE : " + indexReponse);
    $scope.stopAudio();
    if ($rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="simple" || $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="simple10" || $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="paysage" || $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="quizSonore") {
      $scope.reponseQuiz[0]=indexReponse; // save the reponse
      //console.log("saveReponse true ");
    }
    $scope.showValidButton=true;      // then we can display the valid button
  };


  $scope.validReponseE = function() { // when the user had validated the response of the quiz
    //console.log("validReponseE");
    $scope.showValidButton=false;

    if ($rootScope.indexEtape==11) {// spécificités de l'étape 11
      //console.log("spécificité étape 11");
      if ($scope.reponseQuiz[0] == $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse) {
        $scope.win11Message[1] = "Bonne réponse !";
      }
      else {
        $scope.win11Message[1] = "Mauvaise réponse !";
      }
      if ($scope.win11Message[0]=="Mauvaise réponse !" &&  $scope.win11Message[1]=="Mauvaise réponse !") {
        $scope.win[$rootScope.indexEtape] = false;
        $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
      }
      else if ($scope.win11Message[0]=="Bonne réponse !" &&  $scope.win11Message[1]=="Bonne réponse !") {
        $scope.win[$rootScope.indexEtape] = true;
        $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
        $rootScope.score_enfant++;
      }
      else {
        $scope.win[$rootScope.indexEtape] = false;
        $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
        $rootScope.score_enfant=$rootScope.score_enfant+0.5;
      }

      navigator.notification.alert ($scope.win11Message[1], alertCallback, 'Information', 'Ok');
      function alertCallback() {
        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "child")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedE();
            }
          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
            //alertDismissedE();
          });
      }
    }

    else if ($rootScope.indexEtape==10) { // spécificités de l'étape 10

      if (!$scope.etape10Epart1) {
        $scope.etape10Epart1=true;
        $scope.win[$rootScope.indexEtape]=true;


        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape]=false;
        }

        if ($scope.win[$rootScope.indexEtape]) {
          $rootScope.score_enfant=$rootScope.score_enfant + 0.5;
          $scope.win10Message[0]="Bonne réponse !";
        }
        else {
          $scope.win10Message[0]="Mauvaise réponse !";
        }
        navigator.notification.alert ($scope.win10Message[0], alertCallback, 'Information', 'Ok');
        function alertCallback() {
          $scope.reponseQuiz[0]=null;
          $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].questions="Le barrage du Lac de La Raviège a pour rôle principal de stocker l’eau pour la production d’électricité. Mais savez-vous que ce barrage a une autre fonction. Laquelle&nbsp;?";
          $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].reponses=["L’irrigation pour l’agriculture (amener de l’eau dans les cultures ou les champs)","Les loisirs aquatiques (navigation, baignade)","Stocker de l’eau potable pour la consommation des habitants de La Salvetat","L’élevage de poissons"];
          $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse=1;
          $scope.$apply();
        }
      }

      else {
        $scope.win[$rootScope.indexEtape]=true;

        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape]=false;
        }

        if ($scope.win[$rootScope.indexEtape]) {
          $rootScope.score_enfant=$rootScope.score_enfant + 0.5;
          $scope.win10Message[1]="Bonne réponse !";
        }
        else {
          $scope.win10Message[1]="Mauvaise réponse !";
        }

        if ($scope.win10Message[0]=="Mauvaise réponse !" &&  $scope.win10Message[1]=="Mauvaise réponse !") {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
        }
        else if ($scope.win10Message[0]=="Bonne réponse !" &&  $scope.win10Message[1]=="Bonne réponse !") {
          $scope.win[$rootScope.indexEtape] = true;
          $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
        }
        else {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
        }

        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "child")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedE();
            }
          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
            //alertDismissedE();
          });
      }
    }

    else { // pour les autres étapes que la 11

      $scope.win[$rootScope.indexEtape]=true;
      if ($rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType=="simple") {
        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape]=false;
        }

      }
      else {
        for (var i=0; i<$scope.reponseQuiz.length; i++) {
          if ($scope.reponseQuiz[i] != $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].bonnesReponses[i]) {
            $scope.win[$rootScope.indexEtape] = false;
            break;
          }
        }
      }

      if ($scope.win[$rootScope.indexEtape]) {
        $rootScope.score_enfant++;
        $scope.winMessage[$rootScope.indexEtape]="Bonne réponse !";
      }
      else {
        $scope.winMessage[$rootScope.indexEtape]="Mauvaise réponse !";
      }

      dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "child")
        .then(function(successResponse) { // when data loaded
          if (successResponse==true) {
            alertDismissedE();
            if ($rootScope.indexEtape==9 && (httpServices.checkNetworkConnection() != false || httpServices.checkInternetConnection() != false)) {
              $timeout(function () {
                cordova.InAppBrowser.open("http://www.lasalvetat.fr/creee_par_la_nature/cycle_de_leau_la_salvetat_des_bulles_creees_par_la_nature.html", "blank", "closebuttoncaption=fermer");
              }, 3000);
            }


          }
        }, function(errorResponse) { // if data not loaded
          //console.log("ERROR updateDataSteepTableWin");
          //alertDismissedE();
        });
    }
  };


  function alertDismissedE() {
    //console.log("alertDismissedE");
    $rootScope.showQuizE[$rootScope.indexEtape]=false;
    $scope.resetZoom('mainScroll');
    /*
    resetZoom().then(function(greeting) {
        //console.log('Success: ' + greeting);
        resetScroll() ; // on remet le zoom à 1
      }, function(reason) {
        //console.log('Failed: ' + reason);
      }
    );
    */


    if ($rootScope.type_parcours=="M") {// if a mix route is selected
      dataBaseService.selectDataSteepTableVisited($q, $rootScope)
        .then(function(successResponse) { // when data loaded
          if (successResponse==true) {
            //console.log("visited :"  +$rootScope.dataEtape.etape[$rootScope.indexEtape].visited);
            if ($rootScope.dataEtape.etape[$rootScope.indexEtape].visited == "parentValid" ) { // we validate only if the parent had validate the quiz
              $scope.validSteep();
            }
            else {
              dataBaseService.updateDataSteepTableVisited($q, $rootScope, 'enfantValid') // we validate the child quiz
                .then(function(successResponse) { // when data loaded
                  if (successResponse==true) {
                    dataBaseService.updateDataMainTable($q, $rootScope); //  here just to save the eventual new score
                  }
                }, function(errorResponse) { // if data not loaded
                  // todo
                });
            }
          }
          }, function(errorResponse) { // if data not loaded
            // todo
          });
    }
    else { // if only child or adult route is selected, we validate directly the steep
      $scope.validSteep();
    }
  }

  //
  $scope.validReponseP = function() { // when the user had validated the response of the quiz
    //console.log("validReponseP");
    $scope.showValidButton=false;

    if ($rootScope.indexEtape==11) {// spécificités de l'étape 11
      //console.log("spécificité étape 11");
      if ($scope.reponseQuiz[0] == $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse) {
        $scope.win11Message[1] = "Bonne réponse !";
      }
      else {
        $scope.win11Message[1] = "Mauvaise réponse !";
      }
      if ($scope.win11Message[0]=="Mauvaise réponse !" &&  $scope.win11Message[1]=="Mauvaise réponse !") {
        $scope.win[$rootScope.indexEtape] = false;
        $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
      }
      else if ($scope.win11Message[0]=="Bonne réponse !" &&  $scope.win11Message[1]=="Bonne réponse !") {
        $scope.win[$rootScope.indexEtape] = true;
        $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
        $rootScope.score_adulte++;
      }
      else {
        $scope.win[$rootScope.indexEtape] = false;
        $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
        $rootScope.score_adulte=$rootScope.score_adulte+0.5;
      }

      navigator.notification.alert ($scope.win11Message[1], alertCallback, 'Information', 'Ok');
      function alertCallback() {
        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "adult")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedP();
            }

          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
           // alertDismissedP();
          });
      }
    }

    else if ($rootScope.indexEtape==10) { // spécificités de l'étape 10

      if (!$scope.etape10Ppart1) {
        console.log("first part");
        $scope.etape10Ppart1=true;
        $scope.win[$rootScope.indexEtape]=true;

        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape]=false;
        }

        if ($scope.win[$rootScope.indexEtape]) {
          $rootScope.score_adulte=$rootScope.score_adulte + 0.5;
          $scope.win10Message[0]="Bonne réponse !";
        }
        else {
          $scope.win10Message[0]="Mauvaise réponse !";
        }


        navigator.notification.alert ($scope.win10Message[0], alertCallback, 'Information', 'Ok');
        function alertCallback() {
          $scope.reponseQuiz[0]=null;
          $rootScope.dataEtape.etape[$rootScope.indexEtape].questions="Le barrage du Lac de La Raviège a pour rôle principal de stocker l’eau pour la production d’électricité. Mais savez-vous qu’il a également un autre rôle. Lequel&nbsp;?";
          $rootScope.dataEtape.etape[$rootScope.indexEtape].reponses=["L’irrigation pour l’agriculture","Les loisirs nautiques (navigation, baignade)","Stocker de l’eau potable","Pisciculture"];
          $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse=1;
          $scope.$apply();
        }
      }

      else {
        console.log("second part");
        $scope.win[$rootScope.indexEtape]=true;

        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape]=false;
        }

        if ($scope.win[$rootScope.indexEtape]) {
          $rootScope.score_adulte=$rootScope.score_adulte + 0.5;
          $scope.win10Message[1]="Bonne réponse !";
        }
        else {
          $scope.win10Message[1]="Mauvaise réponse !";
        }

        if ($scope.win10Message[0]=="Mauvaise réponse !" &&  $scope.win10Message[1]=="Mauvaise réponse !") {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
        }
        else if ($scope.win10Message[0]=="Bonne réponse !" &&  $scope.win10Message[1]=="Bonne réponse !") {
          $scope.win[$rootScope.indexEtape] = true;
          $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
        }
        else {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
        }

        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "adult")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedP();
            }
          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
            //alertDismissedE();
          });
      }
    }

    else { // pour les autres étapes que la 11

      $scope.win[$rootScope.indexEtape] = true;

      if ($rootScope.dataEtape.etape[$rootScope.indexEtape].quizType == "simple") {
        if ($scope.reponseQuiz[0] != $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse) {
          $scope.win[$rootScope.indexEtape] = false;
        }

      }
      else {
        for (var i = 0; i < $scope.reponseQuiz.length; i++) {
          if ($scope.reponseQuiz[i] != $rootScope.dataEtape.etape[$rootScope.indexEtape].bonnesReponses[i]) {
            $scope.win[$rootScope.indexEtape] = false;
            break;
          }
        }
      }

      if ($scope.win[$rootScope.indexEtape]) {
        $rootScope.score_adulte++;
        $scope.winMessage[$rootScope.indexEtape] = "Bonne réponse !";
      }
      else {
        $scope.winMessage[$rootScope.indexEtape] = "Mauvaise réponse !";
      }
      dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "adult")
        .then(function(successResponse) { // when data loaded
          if (successResponse==true) {
            alertDismissedP();
            if ($rootScope.indexEtape == 9 && (httpServices.checkNetworkConnection() != false || httpServices.checkInternetConnection() != false)) {
              $timeout(function () {
                cordova.InAppBrowser.open("http://www.lasalvetat.fr/creee_par_la_nature/cycle_de_leau_la_salvetat_des_bulles_creees_par_la_nature.html", "blank", "closebuttoncaption=fermer");
              }, 3000);
            }
          }
        }, function(errorResponse) { // if data not loaded
          //console.log("ERROR updateDataSteepTableWin");
        //  alertDismissedP();
        });
    }
  };

  //
  $scope.validReponseQuizPaysageP = function() { // when the user had validated the response in the quiz-paysage-parent-modal view
    //console.log("validReponseQuiePaysageP");

    $scope.showValidButton = false;

      if ($scope.reponseQuiz[0] == $rootScope.dataEtape.etape[$rootScope.indexEtape].indexBonneReponse[$scope.indexPaysage]) {
        $scope.win1Message[$scope.indexPaysage]="Bonne réponse !";
      }
    else {
        $scope.win1Message[$scope.indexPaysage]="Mauvaise réponse !";
      }

    $rootScope.quizMarkerPaysage[0][$scope.indexPaysage]=false;
    $scope.showModalPaysageQuestion=false;
    $scope.reponseQuiz=[];
    $scope.resetZoom('modalPaysageScroll');

      //console.log("$scope.win1Message.length : " + $scope.win1Message.length);
      if ( $rootScope.quizMarkerPaysage[0][0]==false && $rootScope.quizMarkerPaysage[0][1]==false  && $rootScope.quizMarkerPaysage[0][2]==false)
      {
        if ($scope.win1Message[0]=="Mauvaise réponse !" &&  $scope.win1Message[1]=="Mauvaise réponse !" &&  $scope.win1Message[2]=="Mauvaise réponse !") {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
        }
        else if ($scope.win1Message[0]=="Bonne réponse !" &&  $scope.win1Message[1]=="Bonne réponse !" &&  $scope.win1Message[2]=="Bonne réponse !") {
          $scope.win[$rootScope.indexEtape] = true;
          $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
          $rootScope.score_adulte++;
        }
        else {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
          $rootScope.score_adulte=$rootScope.score_adulte+0.5;
        }
        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "adult")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedP();
            }
          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
         //   alertDismissedP();
          });
      }
  };

  //
  $scope.validReponseQuizPaysageE = function() { // when the user had validated the response in the quiz-paysage-enfant-modal view
    //console.log("validReponseQuiePaysageE");
    $scope.showValidButton = false;

    if ($scope.reponseQuiz[0] == $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].indexBonneReponse[$scope.indexPaysage]) {
      $scope.win1Message[$scope.indexPaysage]="Bonne réponse !";
    }
    else {
      $scope.win1Message[$scope.indexPaysage]="Mauvaise réponse !";
    }

    $rootScope.quizMarkerPaysage[1][$scope.indexPaysage]=false;
    $scope.showModalPaysageQuestion=false;
    $scope.reponseQuiz=[];
    $scope.resetZoom('modalPaysageScroll');

      //console.log("$scope.win1Message.length : " + $scope.win1Message.length);
      if ( $rootScope.quizMarkerPaysage[1][0]==false && $rootScope.quizMarkerPaysage[1][1]==false  && $rootScope.quizMarkerPaysage[1][2]==false )
      {
        if ($scope.win1Message[0]=="Mauvaise réponse !" &&  $scope.win1Message[1]=="Mauvaise réponse !" &&  $scope.win1Message[2]=="Mauvaise réponse !") {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Mauvaises réponses !";
        }
        else if ($scope.win1Message[0]=="Bonne réponse !" &&  $scope.win1Message[1]=="Bonne réponse !" &&  $scope.win1Message[2]=="Bonne réponse !") {
          $scope.win[$rootScope.indexEtape] = true;
          $scope.winMessage[$rootScope.indexEtape]="Bonnes réponses !";
          $rootScope.score_enfant++;
        }
        else {
          $scope.win[$rootScope.indexEtape] = false;
          $scope.winMessage[$rootScope.indexEtape]="Tout n'était pas juste !";
          $rootScope.score_enfant =  $rootScope.score_enfant + 0.5;
        }
        dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "child")
          .then(function(successResponse) { // when data loaded
            if (successResponse==true) {
              alertDismissedE();
            }
          }, function(errorResponse) { // if data not loaded
            //console.log("ERROR updateDataSteepTableWin");
          //  alertDismissedE();
          });
      }
  };


  function alertDismissedP() {
    $rootScope.showQuizP[$rootScope.indexEtape]=false;
    $scope.resetZoom('mainScroll');
    /*
    resetZoom().then(function(greeting) {
        //console.log('Success: ' + greeting);
        resetScroll() ; // on remet le zoom à 1
      }, function(reason) {
        //console.log('Failed: ' + reason);
      }
    );
    */

    if ($rootScope.type_parcours=="M") {// if a mix route is selected
      dataBaseService.selectDataSteepTableVisited($q, $rootScope)
        .then(function(successResponse) { // when data loaded
          if (successResponse==true) {
            //console.log("visited :"  +$rootScope.dataEtape.etape[$rootScope.indexEtape].visited);
            if ($rootScope.dataEtape.etape[$rootScope.indexEtape].visited == "enfantValid" ) { // we validate only if the child had validate the quiz
              $scope.validSteep();
            }
            else {
              dataBaseService.updateDataSteepTableVisited($q, $rootScope, 'parentValid')// we validate the parent quiz
                .then(function(successResponse) { // when data loaded
                  if (successResponse==true) {
                    dataBaseService.updateDataMainTable($q, $rootScope); // here just to save the eventual new score
                  }
                }, function(errorResponse) { // if data not loaded
                  // todo
                });
            }
          }

        }, function(errorResponse) { // if data not loaded
          // todo
        });
    }
    else { // if only adult or child route is selected, we validate directly the steep
      $scope.validSteep();
    }
  }


  $scope.updateViewP = function(result) { // appelé quand l'utilisateur a validé le mini-jeu de type phaser
    $scope.win[$rootScope.indexEtape]=result;

    if ($scope.win[$rootScope.indexEtape]) {
      $rootScope.score_adulte++;
      $scope.winMessage[$rootScope.indexEtape]="Bonne réponse !";
    }
    else {
      $scope.winMessage[$rootScope.indexEtape] = "Mauvaise réponse !";
    }
    dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "adult")
      .then(function(successResponse) { // when data loaded
        if (successResponse==true) {
          alertDismissedP();
        }
      }, function(errorResponse) { // if data not loaded
        //console.log("ERROR updateDataSteepTableWin");
      });
  };


  $scope.updateViewE = function(result) {// appelé quand l'utilisateur a validé le mini-jeu de type phaser
    $scope.win[$rootScope.indexEtape]=result;

    if ($scope.win[$rootScope.indexEtape]) {
      $rootScope.score_enfant++;
      $scope.winMessage[$rootScope.indexEtape]="Bonne réponse !";
    }
    else {
      $scope.winMessage[$rootScope.indexEtape]="Mauvaise réponse !";
    }
    dataBaseService.updateDataSteepTableWin($q, $rootScope, $scope, "child")
      .then(function(successResponse) { // when data loaded
        if (successResponse==true) {
          alertDismissedE();
        }
      }, function(errorResponse) { // if data not loaded
        //console.log("ERROR updateDataSteepTableWin");
      });
  };

  //
  $scope.updateViewPOI11P = function(result) { // appelé quand l'utilisateur a validé le mini-jeu de type phaser pour le point11 et permet de relancer sur une deuxième question quiz
    //console.log("updateViewPPOI11P : " + result);
    $scope.win11Message=[];// spécifique pour le POI11
    $scope.showValidButton = false;

    if (result==true) {
      $scope.win11Message[0]="Bonne réponse !";
    }
    else {
      $scope.win11Message[0]="Mauvaise réponse !";
    }

    navigator.notification.alert ($scope.win11Message[0], alertCallback, 'Information', 'Ok');

    function alertCallback() {
      $rootScope.dataEtape.etape[$rootScope.indexEtape].game=false;
      $rootScope.dataEtape.etape[$rootScope.indexEtape].quizType="quizSonore";
      $scope.$apply();
    }
  };

  //
  $scope.updateViewPOI11E = function(result) { // appelé quand l'utilisateur a validé le mini-jeu de type phaser pour le point11 et permet de relancer sur une deuxième question quiz
    //console.log("updateViewPPOI11E: " + result);
    $scope.win11Message=[];// spécifique pour le POI11
    $scope.showValidButton = false;

    if (result==true) {
      $scope.win11Message[0]="Bonne réponse !";
    }
    else {
      $scope.win11Message[0]="Mauvaise réponse !";
    }

    navigator.notification.alert ($scope.win11Message[0], alertCallback, 'Information', 'Ok');

    function alertCallback() {
      $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].game=false;
      $rootScope.dataEtape.etapeEnfant[$rootScope.indexEtape].quizType="quizSonore";
      $scope.$apply();
    }
  };



  $scope.openModal = function(index) {
    $scope.stopAudio();
    if (index==1) {
      $scope.modalChild.show();
    }
    else if (index==2) {
      $scope.modalAdult.show();
    }
    else if (index==3) {
      $scope.modalFinish.show();
    }
    else if (index==4)  {
      $scope.modalQuizPaysageP.show();
    }
    else if (index==5)  {
      $scope.modalQuizPaysageE.show();
    }
  };
  $scope.closeModal = function(index) {
    $scope.stopAudio();
    if (index==1) {
      $scope.modalChild.hide();
      $scope.resetZoom('modalScroll');
    }
    else if (index==2) {
      $scope.modalAdult.hide();
      $scope.resetZoom('modalScroll');
    }
    else if (index==3) {
      $scope.modalFinish.hide();
    }
    else if (index==4)  {
      $scope.modalQuizPaysageP.hide();
      $scope.resetZoom('modalPaysageScroll');
    }
    else if (index==5)  {
      $scope.modalQuizPaysageE.hide();
      $scope.resetZoom('modalPaysageScroll');
    }
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function(event, modal, popover) {
    //$scope.modalChild.remove();
    //$scope.modalAdult.remove();
    // $scope.popover.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function(event, modal) {
    //console.log("modal " + modal.id + " hidden");
    $scope.stopAudio(); // stop audio if needed
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function(event, modal) {
    //console.log("modal " + modal.id + " removed");
  });


  // to load the modal of the lanfscape game for parents
  $scope.clickPaysageP = function(index) {
   // $scope.clickPaysageP = function(event, index) {
    //console.log("click on paysage : " + index);
    //event.preventDefault(); // à utiliser en cas de area
    $scope.indexPaysage=index;
    $scope.openModal(4);
    $scope.showModalPaysageQuestion=true;
  };

  // to load the modal of the lanfscape game for childs
  $scope.clickPaysageE = function(index) {
    //$scope.clickPaysageE = function(event, index) {
    //console.log("click on paysage : " + index);
   // event.preventDefault();
    $scope.indexPaysage=index;
    $scope.openModal(5);
    $scope.showModalPaysageQuestion=true;
  };

  // to activate the audio playing
  $scope.activeAudio = function(audioFile) {

    var os = device.platform;
    //console.log('os : '+os);

    // obligé de différencier les méthodes pour Ios et android car Audio ne marche pas avec les versions anciennes de Ios
    if (os=="Android") {
       var src = cordova.file.applicationDirectory + 'www/data/audio/' + audioFile;
       $rootScope.audio = new Media(src);
       $rootScope.audio.play();
       $scope.showAudio = false;
    }
    else if (os=="iOS") {
      $rootScope.audio = new Audio('data/audio/' + audioFile);
      $rootScope.audio.play();
      $scope.showAudio = false;
    }
    else {
      //console.log("unable to play audio; unknow os")
    }
  };

  // to stop the audio playing
  $scope.stopAudio = function() {
    //  if ($rootScope.dataEtape.etape[$rootScope.indexEtape].audio[0]!=null) {
    if ($rootScope.audio) {
      $rootScope.audio.pause();
      $scope.showAudio = true;
    }
  };


  $scope.resetZoom = function(handle) {
    $ionicScrollDelegate.$getByHandle(handle).zoomTo(1, false);
    $timeout(function() {
     $ionicScrollDelegate.$getByHandle(handle).scrollTop(true);
    }, 1000);

    /*
    return $q(function(resolve, reject) {
      $ionicScrollDelegate.$getByHandle('mainScroll').zoomTo(1, false);
      $timeout(function() {
      resolve('resolve'); // $ionicScrollDelegate met du temps à s'eécuter mais  ne possède pas de callback; envoyer donc le resolve dans un timeout pour laisser le temps au zoom de s'exécuter, sinon il ne s'exécute pas car tué par ionicscrollDelegate.scrollTop
      }, 100);
    });
    */
  };

  resetScroll = function() {
    //console.log("resetScroll");
    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(true);
  }
}

