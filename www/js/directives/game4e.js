/**
 * Created by jerome on 14/04/2016.
 * jeu des paysages
 */
angular.module('myApp.directive4e', [])
.directive('game4e', function () {
  return {
    restrict : 'E',
    replace : true,
    link: function (scope, element, attribute) {
      //console.log('game4e');


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

      var game4e = new Phaser.Game(window.innerWidth*deviceRatio, 700*deviceRatio*ratio, Phaser.CANVAS, 'game4e', {preload: preload, create: create, update: update, render: render }, true);

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
        game4e.load.image('abeille', 'img/game4e/'+ fratio + 'x/abeille@' + fratio + 'x.png');
        game4e.load.image('bourdon', 'img/game4e/'+ fratio + 'x/bourdon@' + fratio + 'x.png');
        game4e.load.image('frelon', 'img/game4e/'+ fratio + 'x/frelon@' + fratio + 'x.png');
        game4e.load.image('guepe', 'img/game4e/'+ fratio + 'x/guepe@' + fratio + 'x.png');
        game4e.load.image('questionEnfant', 'img/game4e/'+ fratio + 'x/questionEnfant@' + fratio + 'x.jpg');
        game4e.load.image('place', 'img/game4e/'+ fratio + 'x/place@' + fratio + 'x.png');
        game4e.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation

      }

      function create() {
        game4e.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
        game4e.physics.startSystem(Phaser.Physics.ARCADE);

        //   game4e.stage.backgroundColor = '#FFFFFF';
        //var puzzleCorps = game4e.add.image(game4e.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
        game4e.add.image(game4e.world.width/2 - (325*ratio*deviceRatio), 0, "questionEnfant").scale.setTo(ratio, ratio);
        places = game4e.add.physicsGroup();
        puzzlePieces = game4e.add.physicsGroup();

        validButton = game4e.add.button(game4e.world.width/2 - (150*ratio*deviceRatio), game4e.world.height - (100*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
        validButton.scale.setTo(ratio, ratio);
        validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item

        var puzzle1 = game4e.add.sprite(game4e.world.width/4 - (102*ratio*deviceRatio), game4e.world.height - (140*ratio*deviceRatio), "frelon");
        var puzzle2 = game4e.add.sprite(game4e.world.width/2 + game4e.world.width/4 - (102*ratio*deviceRatio), game4e.world.height - (140*ratio*deviceRatio), "bourdon");
        var puzzle3 = game4e.add.sprite(game4e.world.width/4 - (102*ratio*deviceRatio), game4e.world.height - (80*ratio*deviceRatio), "abeille");
        var puzzle4 = game4e.add.sprite(game4e.world.width/2 + game4e.world.width/4 - (102*ratio*deviceRatio), game4e.world.height - (80*ratio*deviceRatio), "guepe");
        puzzle1.scale.setTo(ratio, ratio);
        puzzle2.scale.setTo(ratio, ratio);
        puzzle3.scale.setTo(ratio, ratio);
        puzzle4.scale.setTo(ratio, ratio);


        // pour empêcher les sprites de sortir des bords du monde
        game4e.physics.enable([puzzle3, puzzle2, puzzle1, puzzle4], Phaser.Physics.ARCADE);
        puzzle1.body.collideWorldBounds=true;
        puzzle2.body.collideWorldBounds=true;
        puzzle3.body.collideWorldBounds=true;
        puzzle4.body.collideWorldBounds=true;

        puzzleArray=[puzzle3, puzzle2, puzzle1, puzzle4]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
        for (var i= 0; i<puzzleArray.length; i++) {

          puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
          puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
          puzzleArray[i].events.onDragStart.add(onDragStart, this);
          //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
          puzzleArray[i].events.onDragStop.add(onDragStop, this);

          puzzleArray[i].id=i;
          puzzlePieces.add(puzzleArray[i]);
        }
        var place1 = game4e.add.sprite(game4e.world.width/2 - (325*ratio*deviceRatio) + 63*ratio*deviceRatio, 217*ratio*deviceRatio, 'place');
        place1.scale.setTo(ratio, ratio);
        var place2 = game4e.add.sprite(game4e.world.width/2 - (325*ratio*deviceRatio) + 381*ratio*deviceRatio, 217*ratio*deviceRatio, 'place');
        place2.scale.setTo(ratio, ratio);
        var place3 = game4e.add.sprite(game4e.world.width/2 - (325*ratio*deviceRatio) + 63*ratio*deviceRatio, 486*ratio*deviceRatio, 'place');
        place3.scale.setTo(ratio, ratio);
        var place4 = game4e.add.sprite(game4e.world.width/2 - (325*ratio*deviceRatio) + 381*ratio*deviceRatio, 486*ratio*deviceRatio, 'place');
        place4.scale.setTo(ratio, ratio);

        placeArray = [place1, place2, place3, place4];
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
        game4e.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

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
        game4e.state.destroy();
        resultat();
        //  window.setTimeout(function() {resultat()}, 500);
      }

      function resultat() {
        if (reponses[0][0]==reponses[0][1]  && reponses[1][0]==reponses[1][1] && reponses[2][0]==reponses[2][1]
          && reponses[3][0]==reponses[3][1]) {
          //console.log("win");
          scope.updateViewE(true);
        }
        else {
          //console.log("perdu");
          scope.updateViewE(false);
        }
      }

      function update() {
        //    game4e.physics.arcade.overlap(mots, places, collisionHandler, null, this);
      }

      function render() {
        /*
        // game4e.debug.text(result, 10, 20);
         for ( var i= 0; i<placeArray.length; i++) {
           game4e.debug.rectangle(placeArray[i]);
         }
        */


      }

    }
  };
});
