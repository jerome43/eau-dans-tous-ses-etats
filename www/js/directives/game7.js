/**
 * Created by jerome on 14/04/2016.
 * puzzle du bourdon
 */

angular.module('myApp.directive7', [])
  .directive('game7', function () {
    return {
      restrict : 'E',
      replace : true,
      link: function (scope, element, attribute) {
        //console.log('game7');
        // utilisée pour adpater la position des éléments en fonction de la densité de pixel de l'écran
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

        var ratio=window.innerWidth/640; // ratio utilisé pour adapter l'image à la taille de l'écran dividende = largeur de l'image
        //console.log("changed window.devicePixelRatio : " + deviceRatio + " / ratio : " + ratio +  " / window.innerWidth : " + window.innerWidth + " / window.innerHeight : " + window.innerHeight);
        var game7 = new Phaser.Game(window.innerWidth*deviceRatio, 920*deviceRatio*ratio, Phaser.CANVAS, 'game7', {preload: preload, create: create, update: update, render: render }, true);

        // si background transparent
        //var game7 = new Phaser.Game(window.innerWidth, 775*ratio*deviceRatio, Phaser.CANVAS, 'game7', {preload: preload, create: create, update: update, render: render }, true);
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
          game7.load.image('aliments', 'img/game7/'+ fratio + 'x/aliments@' + fratio + 'x.png');
          game7.load.image('cerveau', 'img/game7/'+ fratio + 'x/cerveau@' + fratio + 'x.png');
          game7.load.image('mangeant', 'img/game7/'+ fratio + 'x/mangeant@' + fratio + 'x.png');
          game7.load.image('muscle', 'img/game7/'+ fratio + 'x/muscle@' + fratio + 'x.png');
          game7.load.image('os', 'img/game7/'+ fratio + 'x/os@' + fratio + 'x.png');
          game7.load.image('respiration', 'img/game7/'+ fratio + 'x/respiration@' + fratio + 'x.png');
          game7.load.image('temperature', 'img/game7/'+ fratio + 'x/temperature@' + fratio + 'x.png');
          game7.load.image('question', 'img/game7/'+ fratio + 'x/texte_trou@' + fratio + 'x.jpg');
          game7.load.image('place', 'img/game7/'+ fratio + 'x/place@' + fratio + 'x.png');
          game7.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation
        }

        function create() {
          game7.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
          game7.physics.startSystem(Phaser.Physics.ARCADE);

        //  game7.stage.backgroundColor = '#FFFFFF';
          //var puzzleCorps = game7.add.image(game7.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
          game7.add.image(game7.world.width/2 - (325*ratio*deviceRatio), 0, "question").scale.setTo(ratio, ratio);
          places = game7.add.physicsGroup();
          puzzlePieces = game7.add.physicsGroup();

          validButton = game7.add.button(game7.world.width/2 - (150*ratio*deviceRatio), game7.world.height - (100*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
          validButton.scale.setTo(ratio, ratio);
          validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item

          /*
           var puzzle1 = game7.add.text((30*ratio*deviceRatio), game7.world.height - (200*ratio*deviceRatio), "frelon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left" });
           var puzzle2 = game7.add.text(game7.world.width/4 + (30*ratio*deviceRatio), game7.world.height - (200*ratio*deviceRatio), "bourdon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
           var puzzle3 = game7.add.text(game7.world.width/4*2 + (30*ratio*deviceRatio), game7.world.height - (200*ratio*deviceRatio), "abeille", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
           var puzzle4 = game7.add.text(game7.world.width/4*3 + (30*ratio*deviceRatio), game7.world.height - (200*ratio*deviceRatio), "guêpe", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
           */
          var puzzle1 = game7.add.sprite(game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (100*ratio*deviceRatio), "aliments");
          puzzle1.scale.setTo(ratio, ratio);
          var puzzle2 = game7.add.sprite(game7.world.width/4 + game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (100*ratio*deviceRatio), "cerveau");
          puzzle2.scale.setTo(ratio, ratio);
          var puzzle3 = game7.add.sprite(game7.world.width/4*2 + game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (100*ratio*deviceRatio), "mangeant");
          puzzle3.scale.setTo(ratio, ratio);
          var puzzle4 = game7.add.sprite(game7.world.width/4*3 + game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (100*ratio*deviceRatio), "muscle");
          puzzle4.scale.setTo(ratio, ratio);
          var puzzle5 = game7.add.sprite(game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (50*ratio*deviceRatio), "os");
          puzzle5.scale.setTo(ratio, ratio);
          var puzzle6 = game7.add.sprite(game7.world.width/4 + game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (50*ratio*deviceRatio), "respiration");
          puzzle6.scale.setTo(ratio, ratio);
          var puzzle7 = game7.add.sprite(game7.world.width/4*2 + game7.world.width/8 - (75*ratio*deviceRatio), game7.world.height - (50*ratio*deviceRatio), "temperature");
          puzzle7.scale.setTo(ratio, ratio);


          // pour empêcher les sprites de sortir des bords du monde
          game7.physics.enable([puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7], Phaser.Physics.ARCADE);
          puzzle1.body.collideWorldBounds=true;
          puzzle2.body.collideWorldBounds=true;
          puzzle3.body.collideWorldBounds=true;
          puzzle4.body.collideWorldBounds=true;
          puzzle5.body.collideWorldBounds=true;
          puzzle6.body.collideWorldBounds=true;
          puzzle7.body.collideWorldBounds=true;

          puzzleArray=[puzzle2, puzzle4, puzzle5, puzzle3, puzzle6, puzzle1, puzzle7]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
          for (var i= 0; i<puzzleArray.length; i++) {

            puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
            puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
            puzzleArray[i].events.onDragStart.add(onDragStart, this);
            //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
            puzzleArray[i].events.onDragStop.add(onDragStop, this);

            puzzleArray[i].id=i;
            puzzlePieces.add(puzzleArray[i]);
          }
          var place1 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 265*ratio*deviceRatio, 137*ratio*deviceRatio, 'place');
          place1.scale.setTo(ratio, ratio);
          var place2 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 141*ratio*deviceRatio, 180*ratio*deviceRatio, 'place');
          place2.scale.setTo(ratio, ratio);
          var place3 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 410*ratio*deviceRatio, 180*ratio*deviceRatio, 'place');
          place3.scale.setTo(ratio, ratio);
          var place4 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 190*ratio*deviceRatio, 316*ratio*deviceRatio, 'place');
          place4.scale.setTo(ratio, ratio);
          var place5 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 276*ratio*deviceRatio, 444*ratio*deviceRatio, 'place');
          place5.scale.setTo(ratio, ratio);
          var place6 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 192*ratio*deviceRatio, 538*ratio*deviceRatio, 'place');
          place6.scale.setTo(ratio, ratio);
          var place7 = game7.add.sprite(game7.world.width/2 -325*ratio*deviceRatio + 290*ratio*deviceRatio, 712*ratio*deviceRatio, 'place');
          place7.scale.setTo(ratio, ratio);

          placeArray = [place1, place2, place3, place4, place5, place6, place7];
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
          game7.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

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
            puzzle.reset(place.x+(2*ratio*deviceRatio), place.y-(25*ratio*deviceRatio)); // on centre le dessin sur l'emplacement
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
          game7.state.destroy();
          resultat();
          //  window.setTimeout(function() {resultat()}, 500);
        }

        function resultat() {
          if (reponses[0][0]==reponses[0][1]  && reponses[1][0]==reponses[1][1] && reponses[2][0]==reponses[2][1]
            && reponses[3][0]==reponses[3][1] && reponses[4][0]==reponses[4][1]  && reponses[5][0]==reponses[5][1] && reponses[6][0]==reponses[6][1]) {
            //console.log("win");
            scope.updateViewP(true);
          }
          else {
            //console.log("perdu");
            scope.updateViewP(false);
          }
        }

        function update() {
          //    game7.physics.arcade.overlap(mots, places, collisionHandler, null, this);
        }

        function render() {
          /*
           game7.debug.text(result, 10, 20);
           for ( var i= 0; i<placeArray.length; i++) {
           game7.debug.rectangle(placeArray[i]);
           }
           */

        }
      }
    };
  });
