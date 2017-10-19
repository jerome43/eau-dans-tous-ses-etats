/**
 * Created by jerome on 14/04/2016.
 * puzzle du bourdon
 */

angular.module('myApp.directive11e', [])
.directive('game11e', function () {
  return {
    restrict : 'E',
    replace : true,
    link: function (scope, element, attribute) {
      //console.log('game11e');
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

      var ratio=window.innerWidth/650; // ratio utilisé pour adapter l'image à la taille de l'écran dividende = largeur de l'image
      //console.log("changed window.devicePixelRatio : " + deviceRatio + " / ratio : " + ratio +  " / window.innerWidth : " + window.innerWidth + " / window.innerHeight : " + window.innerHeight);
      var game11e = new Phaser.Game(window.innerWidth*deviceRatio, 600*deviceRatio*ratio, Phaser.CANVAS, 'game11e', {preload: preload, create: create, update: update, render: render }, true);

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
        game11e.load.image('milan', 'img/game11e/'+ fratio + 'x/empreinte_milan@' + fratio + 'x.png');
        game11e.load.image('genette', 'img/game11e/'+ fratio + 'x/empreinte_genette@' + fratio + 'x.png');
        game11e.load.image('canard', 'img/game11e/'+ fratio + 'x/empreinte_canard@' + fratio + 'x.png');
        game11e.load.image('question', 'img/game11e/'+ fratio + 'x/questionE@' + fratio + 'x.jpg');
        game11e.load.image('place', 'img/game11/'+ fratio + 'x/place@' + fratio + 'x.png');
        game11e.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation
      }

      function create() {
        game11e.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
        game11e.physics.startSystem(Phaser.Physics.ARCADE);

      //  game11e.stage.backgroundColor = '#FFFFFF';
        //var puzzleCorps = game11e.add.image(game11e.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
        game11e.add.image(game11e.world.width/2 - (212*ratio*deviceRatio), 0, "question").scale.setTo(ratio, ratio);
        places = game11e.add.physicsGroup();
        puzzlePieces = game11e.add.physicsGroup();

        validButton = game11e.add.button(game11e.world.width/2 - (150*ratio*deviceRatio), game11e.world.height - (155*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
        validButton.scale.setTo(ratio, ratio);
        validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item

        /*
        var puzzle1 = game11e.add.text((30*ratio*deviceRatio), game11e.world.height - (200*ratio*deviceRatio), "frelon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left" });
        var puzzle2 = game11e.add.text(game11e.world.width/4 + (30*ratio*deviceRatio), game11e.world.height - (200*ratio*deviceRatio), "bourdon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        var puzzle3 = game11e.add.text(game11e.world.width/4*2 + (30*ratio*deviceRatio), game11e.world.height - (200*ratio*deviceRatio), "abeille", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        var puzzle4 = game11e.add.text(game11e.world.width/4*3 + (30*ratio*deviceRatio), game11e.world.height - (200*ratio*deviceRatio), "guêpe", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        */
        var puzzle1 = game11e.add.sprite(game11e.world.width/6 - (100*ratio*deviceRatio), game11e.world.height - (160*ratio*deviceRatio), "milan");
        puzzle1.scale.setTo(ratio, ratio);
        var puzzle2 = game11e.add.sprite(game11e.world.width/3 + game11e.world.width/6 - (100*ratio*deviceRatio), game11e.world.height - (160*ratio*deviceRatio), "genette");
        puzzle2.scale.setTo(ratio, ratio);
        var puzzle3 = game11e.add.sprite(game11e.world.width/3*2 + game11e.world.width/6 - (100*ratio*deviceRatio), game11e.world.height - (160*ratio*deviceRatio), "canard");
        puzzle3.scale.setTo(ratio, ratio);

        // pour empêcher les sprites de sortir des bords du monde
        game11e.physics.enable([puzzle1, puzzle2, puzzle3], Phaser.Physics.ARCADE);
        puzzle1.body.collideWorldBounds=true;
        puzzle2.body.collideWorldBounds=true;
        puzzle3.body.collideWorldBounds=true;

        puzzleArray=[puzzle3, puzzle1, puzzle2]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
        for (var i= 0; i<puzzleArray.length; i++) {

          puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
          puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
          puzzleArray[i].events.onDragStart.add(onDragStart, this);
          //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
          puzzleArray[i].events.onDragStop.add(onDragStop, this);

          puzzleArray[i].id=i;
          puzzlePieces.add(puzzleArray[i]);
        }
        var place1 = game11e.add.sprite(game11e.world.width/2 -225*ratio*deviceRatio + 246*ratio*deviceRatio, 77*ratio*deviceRatio, 'place');
        place1.scale.setTo(ratio, ratio);
        var place2 = game11e.add.sprite(game11e.world.width/2 -225*ratio*deviceRatio + 246*ratio*deviceRatio, 211*ratio*deviceRatio, 'place');
        place2.scale.setTo(ratio, ratio);
        var place3 = game11e.add.sprite(game11e.world.width/2 -225*ratio*deviceRatio + 246*ratio*deviceRatio, 346*ratio*deviceRatio, 'place');
        place3.scale.setTo(ratio, ratio);

        placeArray = [place1, place2, place3];
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
        game11e.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

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
          puzzle.reset(place.x+(ratio), place.y-(62*ratio*deviceRatio)); // on centre le dessin sur l'emplacement
          reponses.push(coupleReponse);
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
        game11e.state.destroy();
        resultat();
        //  window.setTimeout(function() {resultat()}, 500);
      }

      function resultat() {
        if (reponses[0][0]==reponses[0][1]  && reponses[1][0]==reponses[1][1] && reponses[2][0]==reponses[2][1]) {
          //console.log("win");
          scope.updateViewPOI11E(true);
        }
        else {
          //console.log("perdu");
          scope.updateViewPOI11E(false);
        }
      }

      function update() {
        //    game11e.physics.arcade.overlap(mots, places, collisionHandler, null, this);
      }

      function render() {
        /*
         game11e.debug.text(result, 10, 20);
         for ( var i= 0; i<placeArray.length; i++) {
         game11e.debug.rectangle(placeArray[i]);
         }
         */
      }
    }
  };
});
