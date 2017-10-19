/**
 * Created by jerome on 14/04/2016.
 * paires à relier : la vie des pollinisateurs
 */
angular.module('myApp.directive6', [])
.directive('game6', function () {
  return {
    restrict : 'E',
    replace : true,
    link: function (scope, element, attribute) {
      //console.log('game6');
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

      var ratio=window.innerWidth/650; // ratio utilisé pour adapter l'image à la taille de l'écran dividende = largeur de l'image
      //console.log("changed window.devicePixelRatio : " + deviceRatio + " / ratio : " + ratio +  " / window.innerWidth : " + window.innerWidth + " / window.innerHeight : " + window.innerHeight);
      var game6 = new Phaser.Game(window.innerWidth*deviceRatio, 580*deviceRatio*ratio, Phaser.CANVAS, 'game6', {preload: preload, create: create, update: update, render: render }, true);

      // si background de couleur
      //var game6 = new Phaser.Game(window.innerWidth, 550*ratio*deviceRatio, Phaser.CANVAS, 'game6', {preload: preload, create: create, update: update, render: render }, false);
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
        game6.load.image('bouche', 'img/game6/'+ fratio + 'x/bouche@' + fratio + 'x.png');
        game6.load.image('adipeuse', 'img/game6/'+ fratio + 'x/adipeuse@' + fratio + 'x.png');
        game6.load.image('anale', 'img/game6/'+ fratio + 'x/anale@' + fratio + 'x.png');
        game6.load.image('caudale', 'img/game6/'+ fratio + 'x/caudale@' + fratio + 'x.png');
        game6.load.image('dorsale', 'img/game6/'+ fratio + 'x/dorsale@' + fratio + 'x.png');
        game6.load.image('pectorale', 'img/game6/'+ fratio + 'x/pectorale@' + fratio + 'x.png');
        game6.load.image('pelvienne', 'img/game6/'+ fratio + 'x/pelvienne@' + fratio + 'x.png');
        game6.load.image('question', 'img/game6/'+ fratio + 'x/questionTruite@' + fratio + 'x.jpg');
        game6.load.image('place', 'img/game6/'+ fratio + 'x/place@' + fratio + 'x.png');
        game6.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation
      }

      function create() {
        game6.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
        game6.physics.startSystem(Phaser.Physics.ARCADE);
        // si background de couleur
       // game6.stage.backgroundColor = '#FFFFFF';
        //var puzzleCorps = game6.add.image(game6.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
        game6.add.image(game6.world.width/2 - (325*ratio*deviceRatio), 0, "question").scale.setTo(ratio, ratio);
        places = game6.add.physicsGroup();
        puzzlePieces = game6.add.physicsGroup();

        validButton = game6.add.button(game6.world.width/2 - (150*ratio*deviceRatio), game6.world.height - (150*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
        validButton.scale.setTo(ratio, ratio);
        validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item


        var puzzle1 = game6.add.sprite(game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (150*ratio*deviceRatio), "bouche");
        var puzzle2 = game6.add.sprite(game6.world.width/3 + game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (150*ratio*deviceRatio), "pectorale");
        var puzzle3 = game6.add.sprite(game6.world.width/3*2 + game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (150*ratio*deviceRatio), "dorsale");
        var puzzle4 = game6.add.sprite(game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (100*ratio*deviceRatio), "caudale");
        var puzzle5 = game6.add.sprite(game6.world.width/3 + game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (100*ratio*deviceRatio), "anale");
        var puzzle6 = game6.add.sprite(game6.world.width/3*2 + game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (100*ratio*deviceRatio), "adipeuse");
        var puzzle7 = game6.add.sprite(game6.world.width/6 - (95*ratio*deviceRatio), game6.world.height - (50*ratio*deviceRatio), "pelvienne");

        puzzle1.scale.setTo(ratio, ratio);
        puzzle2.scale.setTo(ratio, ratio);
        puzzle3.scale.setTo(ratio, ratio);
        puzzle4.scale.setTo(ratio, ratio);
        puzzle5.scale.setTo(ratio, ratio);
        puzzle6.scale.setTo(ratio, ratio);
        puzzle7.scale.setTo(ratio, ratio);


        // pour empêcher les sprites de sortir des bords du monde
        game6.physics.enable([puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7], Phaser.Physics.ARCADE);
        puzzle1.body.collideWorldBounds=true;
        puzzle2.body.collideWorldBounds=true;
        puzzle3.body.collideWorldBounds=true;
        puzzle4.body.collideWorldBounds=true;
        puzzle5.body.collideWorldBounds=true;
        puzzle6.body.collideWorldBounds=true;
        puzzle7.body.collideWorldBounds=true;

        puzzleArray=[puzzle4, puzzle6, puzzle3, puzzle1, puzzle5, puzzle7, puzzle2]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
        for (var i= 0; i<puzzleArray.length; i++) {

          puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
          puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
          puzzleArray[i].events.onDragStart.add(onDragStart, this);
          //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
          puzzleArray[i].events.onDragStop.add(onDragStop, this);

          puzzleArray[i].id=i;
          puzzlePieces.add(puzzleArray[i]);
        }
        var place1 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 5*ratio*deviceRatio, 30*ratio*deviceRatio, 'place');
        place1.scale.setTo(ratio, ratio);
        var place2 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 160*ratio*deviceRatio, 90*ratio*deviceRatio, 'place');
        place2.scale.setTo(ratio, ratio);
        var place3 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 393*ratio*deviceRatio, 70*ratio*deviceRatio, 'place');
        place3.scale.setTo(ratio, ratio);
        var place4 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 540*ratio*deviceRatio, 120*ratio*deviceRatio, 'place');
        place4.scale.setTo(ratio, ratio);
        var place5 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 40*ratio*deviceRatio, 330*ratio*deviceRatio, 'place');
        place5.scale.setTo(ratio, ratio);
        var place6 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 235*ratio*deviceRatio, 350*ratio*deviceRatio, 'place');
        place6.scale.setTo(ratio, ratio);
        var place7 = game6.add.sprite(game6.world.width/2 -320*ratio*deviceRatio + 440*ratio*deviceRatio, 315*ratio*deviceRatio, 'place');
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
        game6.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

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
        game6.state.destroy();
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
        //    game6.physics.arcade.overlap(mots, places, collisionHandler, null, this);
      }

      function render() {

       /*  game6.debug.text(result, 10, 20);
         for ( var i= 0; i<placeArray.length; i++) {
         game6.debug.rectangle(placeArray[i]);
         }
      */
      }
    }
  };
});
