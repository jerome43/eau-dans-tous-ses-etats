/**
 * Created by jerome on 14/04/2016.
 * puzzle du bourdon
 */

angular.module('myApp.directive5', [])
.directive('game5', function () {
  return {
    restrict : 'E',
    replace : true,
    link: function (scope, element, attribute) {
      //console.log('game5');
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
      var game5 = new Phaser.Game(window.innerWidth*deviceRatio, 775*deviceRatio*ratio, Phaser.CANVAS, 'game5', {preload: preload, create: create, update: update, render: render }, true);

      // si background de couleur
      //var game5 = new Phaser.Game(window.innerWidth, 775*ratio*deviceRatio, Phaser.CANVAS, 'game5', {preload: preload, create: create, update: update, render: render }, false);
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
        game5.load.image('arrosage', 'img/game5/'+ fratio + 'x/arrosage@' + fratio + 'x.png');
        game5.load.image('autre', 'img/game5/'+ fratio + 'x/autre@' + fratio + 'x.png');
        game5.load.image('cuisson', 'img/game5/'+ fratio + 'x/cuisson@' + fratio + 'x.png');
        game5.load.image('linge', 'img/game5/'+ fratio + 'x/linge@' + fratio + 'x.png');
        game5.load.image('soin', 'img/game5/'+ fratio + 'x/soin@' + fratio + 'x.png');
        game5.load.image('vaisselle', 'img/game5/'+ fratio + 'x/vaisselle@' + fratio + 'x.png');
        game5.load.image('voiture', 'img/game5/'+ fratio + 'x/voiture@' + fratio + 'x.png');
        game5.load.image('wc', 'img/game5/'+ fratio + 'x/wc@' + fratio + 'x.png');
        game5.load.image('question', 'img/game5/'+ fratio + 'x/questionAdulte@' + fratio + 'x.jpg');
        game5.load.image('place', 'img/game5/'+ fratio + 'x/place@' + fratio + 'x.png');
        game5.load.spritesheet('validButton', 'img/valid_button@' + fratio + 'x.png', 301*deviceRatio, 72*deviceRatio); // chargement de l'image-sprite du bouton de validation
      }

      function create() {
        game5.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // redimensionne l'image pour qu'elle prenne toute la largeur du canvas en gardant les proprotions
        game5.physics.startSystem(Phaser.Physics.ARCADE);

        // si background de couleur
        //game5.stage.backgroundColor = '#FFFFFF';
        //var puzzleCorps = game5.add.image(game5.world.width/2 - (386.5*ratio*deviceRatio), 0, "puzzleCorps");
        game5.add.image(game5.world.width/2 - (325*ratio*deviceRatio), 0, "question").scale.setTo(ratio, ratio);
        places = game5.add.physicsGroup();
        puzzlePieces = game5.add.physicsGroup();

        validButton = game5.add.button(game5.world.width/2 - (150*ratio*deviceRatio), game5.world.height - (200*ratio*deviceRatio), 'validButton', onUpValidButton, this, 1, 0, 1, 1); // création du bouton d'annulation
        validButton.scale.setTo(ratio, ratio);
        validButton.kill(); // on le tue, il est caché tant qu'on a pas sélectionné d'item

        /*
        var puzzle1 = game5.add.text((30*ratio*deviceRatio), game5.world.height - (200*ratio*deviceRatio), "frelon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left" });
        var puzzle2 = game5.add.text(game5.world.width/4 + (30*ratio*deviceRatio), game5.world.height - (200*ratio*deviceRatio), "bourdon", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        var puzzle3 = game5.add.text(game5.world.width/4*2 + (30*ratio*deviceRatio), game5.world.height - (200*ratio*deviceRatio), "abeille", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        var puzzle4 = game5.add.text(game5.world.width/4*3 + (30*ratio*deviceRatio), game5.world.height - (200*ratio*deviceRatio), "guêpe", { font: "20px gauntle", fontWeight:"bold", fill: "#68a0d6", align: "left", boundsAlignH : "left"  });
        */
        var puzzle1 = game5.add.sprite(game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (210*ratio*deviceRatio), "arrosage");
        puzzle1.scale.setTo(ratio, ratio);
        var puzzle2 = game5.add.sprite(game5.world.width/4 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (210*ratio*deviceRatio), "autre");
        puzzle2.scale.setTo(ratio, ratio);
        var puzzle3 = game5.add.sprite(game5.world.width/4*2 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (210*ratio*deviceRatio), "cuisson");
        puzzle3.scale.setTo(ratio, ratio);
        var puzzle4 = game5.add.sprite(game5.world.width/4*3 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (210*ratio*deviceRatio), "linge");
        puzzle4.scale.setTo(ratio, ratio);
        var puzzle5 = game5.add.sprite(game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (140*ratio*deviceRatio), "soin");
        puzzle5.scale.setTo(ratio, ratio);
        var puzzle6 = game5.add.sprite(game5.world.width/4 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (140*ratio*deviceRatio), "wc");
        puzzle6.scale.setTo(ratio, ratio);
        var puzzle7 = game5.add.sprite(game5.world.width/4*2 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (140*ratio*deviceRatio), "voiture");
        puzzle7.scale.setTo(ratio, ratio);
        var puzzle8 = game5.add.sprite(game5.world.width/4*3 + game5.world.width/8 - (75*ratio*deviceRatio), game5.world.height - (140*ratio*deviceRatio), "vaisselle");
        puzzle8.scale.setTo(ratio, ratio);


        // pour empêcher les sprites de sortir des bords du monde
        game5.physics.enable([puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7, puzzle8], Phaser.Physics.ARCADE);
        puzzle1.body.collideWorldBounds=true;
        puzzle2.body.collideWorldBounds=true;
        puzzle3.body.collideWorldBounds=true;
        puzzle4.body.collideWorldBounds=true;
        puzzle5.body.collideWorldBounds=true;
        puzzle6.body.collideWorldBounds=true;
        puzzle7.body.collideWorldBounds=true;
        puzzle8.body.collideWorldBounds=true;

        puzzleArray=[puzzle3, puzzle7, puzzle2, puzzle8, puzzle1, puzzle4, puzzle6, puzzle5]; //ici on définit les bonnes réponses suivant leur ordre dans le tableau
        for (var i= 0; i<puzzleArray.length; i++) {

          puzzleArray[i].inputEnabled = true; // par défaut, on peut les sélectionner
          puzzleArray[i].input.enableDrag(); // true = run a pixel perfect check ONLY when you click on the Sprite
          puzzleArray[i].events.onDragStart.add(onDragStart, this);
          //puzzleArray[i].events.onDragUpdate.add(dragUpdate);
          puzzleArray[i].events.onDragStop.add(onDragStop, this);

          puzzleArray[i].id=i;
          puzzlePieces.add(puzzleArray[i]);
        }
        var place1 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 58*ratio*deviceRatio, 30*ratio*deviceRatio, 'place');
        place1.scale.setTo(ratio, ratio);
        var place2 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 58*ratio*deviceRatio, 108*ratio*deviceRatio, 'place');
        place2.scale.setTo(ratio, ratio);
        var place3 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 58*ratio*deviceRatio, 200*ratio*deviceRatio, 'place');
        place3.scale.setTo(ratio, ratio);
        var place4 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 58*ratio*deviceRatio, 314*ratio*deviceRatio, 'place');
        place4.scale.setTo(ratio, ratio);
        var place5 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 58*ratio*deviceRatio, 425*ratio*deviceRatio, 'place');
        place5.scale.setTo(ratio, ratio);
        var place6 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 344*ratio*deviceRatio, 73*ratio*deviceRatio, 'place');
        place6.scale.setTo(ratio, ratio);
        var place7 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 344*ratio*deviceRatio, 233*ratio*deviceRatio, 'place');
        place7.scale.setTo(ratio, ratio);
        var place8 = game5.add.sprite(game5.world.width/2 -325*ratio*deviceRatio + 344*ratio*deviceRatio, 420*ratio*deviceRatio, 'place');
        place8.scale.setTo(ratio, ratio);

        placeArray = [place1, place2, place3, place4, place5, place6, place7, place8];
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
        game5.physics.arcade.overlap(puzzlePieces, places, overlapsHandler, null, this);

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
        game5.state.destroy();
        resultat();
        //  window.setTimeout(function() {resultat()}, 500);
      }

      function resultat() {
        if (reponses[0][0]==reponses[0][1]  && reponses[1][0]==reponses[1][1] && reponses[2][0]==reponses[2][1]
          && reponses[3][0]==reponses[3][1] && reponses[4][0]==reponses[4][1]  && reponses[5][0]==reponses[5][1] && reponses[6][0]==reponses[6][1]
        && reponses[7][0]==reponses[7][1]) {
          //console.log("win");
          scope.updateViewP(true);
        }
        else {
          //console.log("perdu");
          scope.updateViewP(false);
        }
      }

      function update() {
        //    game5.physics.arcade.overlap(mots, places, collisionHandler, null, this);
      }

      function render() {
        /*
         game5.debug.text(result, 10, 20);
         for ( var i= 0; i<placeArray.length; i++) {
         game5.debug.rectangle(placeArray[i]);
         }
         */
      }
    }
  };
});
