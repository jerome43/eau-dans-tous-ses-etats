/**
 * Created by jerome on 14/04/2016.
 * utilisé pour récupérer largeur de l'image dans le jeu paysage (qui varie selon les tailles d'écran et déterminer à partir de cette valeur les zones à cliquer
 */
angular.module('myApp.directive-get-width-e', [])
.directive('getWidthE', function ($rootScope) {
    return {
        restrict : 'A',
      //  scope : {}, // on utilise un scope isolé, (on accède au scope Parent par $parent)
       // template : '<div style="position: absolute; "><img ng-src="img/{{$parent.dataEtape.etapeEnfant[$parent.indexEtape].image[1]}}" style="display:block; margin:0 auto; width:95%"/><img ng-src="img/icon/1X/ic_place_blue_1.png" alt="touchez-moi pour affcher la question" ng-show="$parent.quizMarkerPaysage[1][0]" ng-click="$parent.clickPaysageE(0)" style="position: absolute; top:calc(90px/{{ratio}}); left : calc(660px/{{ratio}}); width:-webkit-calc(32px/{{ratio}}); width:calc(32px/{{ratio}})"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="$parent.quizMarkerPaysage[1][1]" ng-click="$parent.clickPaysageE(1)" style="position: absolute; top:calc(270px/{{ratio}}); left : calc(90px/{{ratio}}); width:-webkit-calc(32px/{{ratio}}); width:calc(32px/{{ratio}})"/><img ng-src="img/icon/1X/ic_place_blue_3.png" alt="touchez-moi pour affcher la question" ng-show="$parent.quizMarkerPaysage[1][2]" ng-click="$parent.clickPaysageE(2)" style="position: absolute; top:calc(420px/{{ratio}}); left : calc(60px/{{ratio}}); width:-webkit-calc(32px/{{ratio}}); width:calc(32px/{{ratio}})"/></div></div>',
      template : '<div style="min-height:calc(450px/{{ratio}}); "><div style="position: absolute; "><img  ng-src="img/{{dataEtape.etapeEnfant[indexEtape].image[1]}}" style="display:block; margin:0 auto; width:95%"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[1][0]" ng-click="clickPaysageE(0)" style="position: absolute; top:calc(90px/{{ratio}}); left : calc(600px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[1][1]" ng-click="clickPaysageE(1)" style="position: absolute; top:calc(240px/{{ratio}}); left : calc(80px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[1][2]" ng-click="clickPaysageE(2)" style="position: absolute; top:calc(370px/{{ratio}}); left : calc(50px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/></div></div>',
      link: function (scope, element, attrs) {
          //console.log('getWidthE');
        //  console.log("width : " + element.parent().width()); //jquery language
          // element retourne un tableau, donc prendre element[0] si on a affaire à un unique élément html

        //console.log("width E: " + element[0].clientWidth);
        if (element[0].clientWidth!=0) {
          $rootScope.ratio=700/(element[0].clientWidth*0.95);
        }
        //console.log("ratio directive E : " + scope.ratio);
          //var ratio=700/(element[0].clientWidth*0.95);
          //scope.areaCoords=[[10/ratio,390/ratio,110/ratio,450/ratio],[50/ratio,260/ratio,150/ratio,320/ratio],[ 600/ratio,90/ratio,700/ratio,150/ratio]];

        }
    };
});
