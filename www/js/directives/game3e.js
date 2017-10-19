/**
 * Created by jerome on 19/09/16.
 */
/**
 * Created by jerome on 14/04/2016.
 * mot mystère
 */
angular.module('myApp.directive3e', [])
  .directive('game3e', function () {
    return {
      restrict : 'E',
      replace : true,
      link: function (scope, element, attribute) {
        //console.log('game3e');


        var deviceRatio = window.devicePixelRatio; // utilisée pour adpater la position des éléments en fonction de la densité de pixel de l'écran
        //console.log("initial window.devicePixelRatio : " + deviceRatio);
        if (deviceRatio<1.5) {
          deviceRatio=1;
        }
        else if (deviceRatio>=1.5 && deviceRatio<2) {
          deviceRatio=1.5;
        }
        else if (deviceRatio>=2 && deviceRatio<2.5) {
          deviceRatio = 2;
        }
        else if (deviceRatio>=2.5 && deviceRatio<3) {
          deviceRatio = 2.5;
        }
        else if (deviceRatio>=3) {
          deviceRatio=3;
        }

        var ratio=window.innerWidth/700; // ratio utilisé pour adapter l'image à la taille de l'écran dividende = largeur de l'image
        //console.log("changed window.devicePixelRatio : " + deviceRatio + " / ratio : " + ratio +  " / window.innerWidth : " + window.innerWidth + " / window.innerHeight : " + window.innerHeight);

        var game3e = new Phaser.Game(window.innerWidth*deviceRatio, 650*deviceRatio*ratio, Phaser.CANVAS, 'game3e', {preload: preload, create: create, update: update, render: render }, true);
        // si background de couleur
        //var game3e = new Phaser.Game(window.innerWidth, 550*ratio*deviceRatio, Phaser.CANVAS, 'game3e', {preload: preload, create: create, update: update, render: render }, false);
        var puzzleArray=[]; // paysages à placer
        var placeArray = []; // emplacement vides pour recevoir les mots
        var result = 'Drag a sprite'; // pour débugagae
        var places;
        var puzzlePieces;
        var reponses = []; // tableau des réponses de l'utilisateur
        var reponsesCopy = []; // tableau des n-1 réponses de l'utilisateur
        var validButton; // bouton de validation des réponses
        var currentSpritePosition = {x:null, y:null}; // pour se souvenir de la position initiale du sprite et le replacer à son point de départ


        function preload() {
          var fratio; // ratio utilisé dans le nommage de fichier suivant densité pixel de type image@1x.png
          switch (deviceRatio) {
            case  1 : fratio="1"; break;
            case  1.5 : fratio="1-5"; break;
            case  2 : fratio="2"; break;
            case  2.5 : fratio="2-5"; break;
            case  3 : fratio="3"; break;
          }

          //console.log("load image : " + fratio + "x");
          game3e.load.image('agriculture', 'img/game3e/'+ fratio + 'x/vachesE@' + fratio + 'x.png');
          game3e.load.image('foret', 'img/game3e/'+ fratio + 'x/arbresE@' + fratio + 'x.png');
          game3e.load.image('habitation', 'img/game3e/'+ fratio + 'x/doucheE@' + fratio + 'x.png');
          game3e.load.image('jardin', 'img/game3e/'+ fratio + 'x/jardinE@' + fratio + 'x.png');
          game3e.load.image('ripisylve', 'img/game3e/'+ fratio + 'x/poissonE@' + fratio + 'x.png');
          game3e.load.image('question', 'img/game3e/'+ fratio + 'x/questionEnfant@' + fratio + 'x.jpg');
          game3e.load.image('place', 'img/game3/'+ fratio + 'x/place@' + fratio + 'x.png');
          game3e.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation

        }

        function create() {
          game3e.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
          game3e.physics.startSystem(Phaser.Physics.ARCADE);
          // si background de couleur
          // game3e.stage.backgroundColor = '#FFFFFF';
          //var puzzleCorps = game3e.add.image(game3e.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
          game3e.add.image(game3e.world.width/2 - (350*ratio*deviceRatio), 0, "question").scale.setTo(ratio, ratio);
          places = game3e.add.physicsGroup();
          puzzlePieces = game3e.add.physicsGroup();

          validButton = game3e.add.button(game3e.world.width/2 - (150*ratio*deviceRatio), game3e.world.height - (100*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
          validButton.scale.setTo(ratio, ratio);
          validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item


          var puzzle1 = game3e.add.sprite(game3e.world.width/6 - (102*ratio*deviceRatio), game3e.world.height - (140*ratio*deviceRatio), "agriculture");
          var puzzle2 = game3e.add.sprite(game3e.world.width/3 + game3e.world.width/6 - (102*ratio*deviceRatio), game3e.world.height - (140*ratio*deviceRatio), "foret");
          var puzzle3 = game3e.add.sprite(game3e.world.width/3*2 + game3e.world.width/6 - (102*ratio*deviceRatio), game3e.world.height - (140*ratio*deviceRatio), "habitation");
          var puzzle4 = game3e.add.sprite(game3e.world.width/6 - (102*ratio*deviceRatio), game3e.world.height - (80*ratio*deviceRatio), "jardin");
          var puzzle5 = game3e.add.sprite(game3e.world.width/3 + game3e.world.width/6 - (102*ratio*deviceRatio), game3e.world.height - (80*ratio*deviceRatio), "ripisylve");

          puzzle1.scale.setTo(ratio, ratio);
          puzzle2.scale.setTo(ratio, ratio);
          puzzle3.scale.setTo(ratio, ratio);
          puzzle4.scale.setTo(ratio, ratio);
          puzzle5.scale.setTo(ratio, ratio);


          // pour empêcher les sprites de sortir des bords du monde
          game3e.physics.enable([puzzle1, puzzle2, puzzle3, puzzle4, puzzle5], Phaser.Physics.ARCADE);
          puzzle1.body.collideWorldBounds=true;
          puzzle2.body.collideWorldBounds=true;
          puzzle3.body.collideWorldBounds=true;
          puzzle4.body.collideWorldBounds=true;
          puzzle5.body.collideWorldBounds=true;

          //puzzleArray=[puzzle1, puzzle4, puzzle5, puzzle2, puzzle3]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
          puzzleArray=[puzzle1, puzzle2, puzzle3, puzzle4, puzzle5]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
          for (var i= 0; i<puzzleArray.length; i++) {

            puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
            puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
            puzzleArray[i].events.onDragStart.add(onDragStart, this);
            //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
            puzzleArray[i].events.onDragStop.add(onDragStop, this);

            puzzleArray[i].id=i;
            puzzlePieces.add(puzzleArray[i]);
          }
          var place1 = game3e.add.sprite(game3e.world.width/2 -350*ratio*deviceRatio + 3*ratio*deviceRatio, 253*ratio*deviceRatio, 'place');
          place1.scale.setTo(ratio, ratio);
          var place2 = game3e.add.sprite(game3e.world.width/2 -350*ratio*deviceRatio + 421*ratio*deviceRatio, 127*ratio*deviceRatio, 'place');
          place2.scale.setTo(ratio, ratio);
          var place3 = game3e.add.sprite(game3e.world.width/2 -350*ratio*deviceRatio + 490*ratio*deviceRatio, 393*ratio*deviceRatio, 'place');
          place3.scale.setTo(ratio, ratio);
          var place4 = game3e.add.sprite(game3e.world.width/2 -350*ratio*deviceRatio + 270*ratio*deviceRatio, 323*ratio*deviceRatio, 'place');
          place4.scale.setTo(ratio, ratio);
          var place5 = game3e.add.sprite(game3e.world.width/2 -350*ratio*deviceRatio + 299*ratio*deviceRatio, 241*ratio*deviceRatio, 'place');
          place5.scale.setTo(ratio, ratio);

          placeArray = [place1, place2, place3, place4, place5];
          for (var ii= 0; ii<placeArray.length; ii++) {
            placeArray[ii].id=ii;
            places.add(placeArray[ii]);
          }
        }

        function onDragStart(sprite, pointer) {
          reponsesCopy=[];
          reponsesCopy=reponses.slice(); // crée une copie du tableau
          // result = "Dragging " + sprite.id;
          currentSpritePosition.x = sprite.x;
          currentSpritePosition.y = sprite.y;
        }

        function onDragStop(sprite, pointer) {
          reponses = [];
          game3e.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

          //  result = sprite.id + " dropped at x:" + pointer.x + " y: " + pointer.y;
        }

        function overlapsHandler (puzzle, place) {
          //console.log("overlaps entre puzzlePieces.id : " + puzzle.id + " place.id : " + place.id);
          var testInArray=false;
          var coupleReponse = [puzzle.id, place.id];

          for (var i =0; i<reponsesCopy.length; i++) { // test si la place n'était pas déjà occupée par une autre image
            if (place.id==reponsesCopy[i][1] && puzzle.id!=reponsesCopy[i][0]) {
              testInArray = true;
              puzzle.reset(currentSpritePosition.x, currentSpritePosition.y);// on replace le mot à sa position initiale pour que l'utilisateur voit qu'il est mal placé
              break;
            }
          }
          if (!testInArray) {
            reponses.push(coupleReponse);
            puzzle.reset(place.x, place.y); // on centre le dessin sur l'emplacement
          }

          //console.log(reponses.length);
          if (reponses.length>=placeArray.length) {
            validButton.revive(); // on active le button de validation
          }
          else {
            if (validButton.alive) {// on désactive le bouton de validation si il était affiché
              validButton.kill();
            }
          }
        }

        function onUpValidButton(button, pointer, isOver) {
          game3e.state.destroy();
          resultat();
          //  window.setTimeout(function() {resultat()}, 500);
        }

        function resultat() {
          if (reponses[0][0]==reponses[0][1]  && reponses[1][0]==reponses[1][1] && reponses[2][0]==reponses[2][1]
            && reponses[3][0]==reponses[3][1] && reponses[4][0]==reponses[4][1]) {
            //console.log("win");
            scope.updateViewE(true);
          }
          else {
            //console.log("perdu");
            scope.updateViewE(false);
          }
        }

        function update() {
          //    game3e.physics.arcade.overlap(mots, places, collisionHandler, null, this);
        }

        function render() {
          /*
           game3e.debug.text(result, 10, 20);
           for ( var i= 0; i<placeArray.length; i++) {
           game3e.debug.rectangle(placeArray[i]);
           }
           */

        }
      }
    };
  });
