/**
 * Created by jerome on 14/04/2016.
 * utilisé pour récupérer largeur de l'image dans le jeu paysage (qui varie selon les tailles d'écran et déterminer à partir de cette valeur les zones à cliquer
 */
angular.module('myApp.directive-get-width', [])
.directive('getWidth', function ($rootScope) {
    return {
        restrict : 'A',
      //  scope : {}, // on utilise un scope isolé, (on accède au scope Parent par $parent)
      template : '<div style="min-height:calc(450px/{{ratio}}); "><div style="position: absolute; "><img ng-src="img/{{dataEtape.etape[indexEtape].image[1]}}" style="display:block; margin:0 auto; width:calc(700px/{{ratio}})"/><img src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[0][0]" ng-click="clickPaysageP(0)" style="position: absolute; top:calc(90px/{{ratio}}); left : calc(600px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[0][1]" ng-click="clickPaysageP(1)" style="position: absolute; top:calc(240px/{{ratio}}); left : calc(80px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/><img ng-src="img/icon/1X/focus.png" alt="touchez-moi pour affcher la question" ng-show="quizMarkerPaysage[0][2]" ng-click="clickPaysageP(2)" style="position: absolute; top:calc(370px/{{ratio}}); left : calc(50px/{{ratio}}); width:-webkit-calc(100px/{{ratio}}); width:calc(100px/{{ratio}})"/></div></div>',
      link: function (scope, element, attrs) {
          //console.log('getWidth');
        //console.log("width : " + element.parent().width()); //jquery language
          // element retourne un tableau, donc prendre element[0] si on a affaire à un unique élément html
          if (element[0].clientWidth!=0) {
            $rootScope.ratio=700/(element[0].clientWidth*0.95);
          }
          //console.log("ratio directive : " + scope.ratio);

          //var ratio=700/(element[0].clientWidth*0.95);
          //scope.areaCoords=[[10/ratio,390/ratio,110/ratio,450/ratio],[50/ratio,260/ratio,150/ratio,320/ratio],[ 600/ratio,90/ratio,700/ratio,150/ratio]];

        }
    };
});
