/**
 * Created by jerome on 17/03/2016.
 */

function DataBaseService() {

  this.createDatabase = function($q) {
    //console.log('createDataBase');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady1, false);

// Cordova is ready
    function onDeviceReady1() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS main_table (id INTEGER PRIMARY KEY, etape INTEGER, score_enfant INTEGER, score_adulte INTEGER, type_parcours VARCHAR, map_loaded VARCHAR)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS steep_table (id INTEGER PRIMARY KEY, visited VARCHAR, winAdult VARCHAR, winMessageAdult VARCHAR, winChild VARCHAR, winMessageChild VARCHAR)');
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction createDataBase ok');
            db.close(function () {
              //console.log('database createDataBase is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.testDataBaseEmpty = function($q) {
      //console.log('testDataBaseEmpty');
    var deferred = $q.defer();
      var resultTest = 0;
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM main_table;", [], function (tx, res) {
              if (res.rows.length == 0) {
                resultTest = 0
              }
              else {
                resultTest = 1
              }
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction testDataBaseEmpty ok');
            db.close(function () {
              //console.log('database testDataBaseEmpty is closed ok, return result : ' + resultTest );
             // deferred.resolve(
              // console.log('defered resolve testDataBaseEmpty'), {"resultTest" : resultTest}
              // );
              deferred.resolve({resultTest : resultTest});
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    return deferred.promise;
  };

  this.insertInitialData = function($q, $rootScope) {
    //console.log('insertInitialData');
    var deferred = $q.defer();
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query1 = "INSERT INTO main_table (etape, score_enfant, score_adulte, type_parcours, map_loaded) VALUES (?,?,?,?,?)";
            var query2 = "INSERT INTO steep_table (visited) VALUES (?)";
            tx.executeSql(query1, [1, 0, 0, "M", "false"], function (tx, res) {
            });
          var i =1;
            while (i<$rootScope.dataEtape.etape.length) {
              tx.executeSql(query2, ["false"], function (tx, res) {
              });
              i++
            }

          /*
          // to test the finish process
          while (i<$rootScope.dataEtape.etape.length-1) {
            tx.executeSql(query2, ["true"], function (tx, res) {
            });
            i++
          }
            tx.executeSql(query2, ["false"], function (tx, res) {
            });
            */

          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction insertInitialData ok');
            db.close(function () {
              //console.log('database insertInitialData is closed ok');
              deferred.resolve(true);
             // new DataBaseService().selectDataMainTable($rootScope)
            });
          });
      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    return deferred.promise;
  };

  this.resetDataBase =  function($q) {
    //console.log('resetDataBase');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady4, false);

// Cordova is ready
    function onDeviceReady4() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS main_table');
            tx.executeSql('DROP TABLE IF EXISTS steep_table');
            tx.executeSql('CREATE TABLE IF NOT EXISTS main_table (id INTEGER PRIMARY KEY, etape INTEGER, score_enfant INTEGER, score_adulte INTEGER, type_parcours VARCHAR, map_loaded VARCHAR)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS steep_table (id INTEGER PRIMARY KEY, visited VARCHAR, winAdult VARCHAR, winMessageAdult VARCHAR, winChild VARCHAR, winMessageChild VARCHAR)');
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction ok');
            db.close(function () {
              //console.log('database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.insertDataMainTable = function($q, $rootScope) {
    //console.log("insertDataMainTable");
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady5, false);

// Cordova is ready
    function onDeviceReady5() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "INSERT INTO main_table (etape, score_enfant, score_adulte, type_parcours, map_loaded) VALUES (?,?,?,?,?)";
            tx.executeSql(query, [$rootScope.indexEtape, $rootScope.score_enfant, $rootScope.score_adulte, $rootScope.type_parcours, $rootScope.map_loaded], function (tx, res) {
              //console.log("insertDataMainTable insertId: " + res.insertId + " -- probably 1");
              //console.log("insertDataMainTable rowsAffected: " + res.rowsAffected + " -- should be 1");
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction insertDataMainTable ok');
            db.close(function () {
              //console.log('database insertDataMainTable is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };


  this.updateDataMainTable = function($q, $rootScope) {
    //console.log('updateDataMainTable');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady6, false);

// Cordova is ready
    function onDeviceReady6() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "UPDATE main_table SET etape=?, score_enfant=?, score_adulte=?, type_parcours=?, map_loaded=?";
            //   var query = "UPDATE main_table SET etape = ?, score_enfant=?, score_adulte=? WHERE id=?"; // avec id
            tx.executeSql(query, [$rootScope.indexEtape, $rootScope.score_enfant, $rootScope.score_adulte, $rootScope.type_parcours, $rootScope.map_loaded], function (tx, res) {
              //console.log("updateDataMainTable rowsAffected: " + res.rowsAffected + " -- should be 1");
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction updateDataMainTable ok');
            db.close(function () {
              //console.log('updateDataMainTable database is closed ok');
            // deferred.resolve(
              // console.log('defered resolve updateMainTable')
              // );
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.updateDataSteepTableVisited = function($q, $rootScope, value) {
    //console.log('updateDataSteepTableVisited : indexEtape : ' + $rootScope.indexEtape + " : " + value);
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady7, false);

// Cordova is ready
    function onDeviceReady7() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "UPDATE steep_table SET visited=? WHERE id=?";
            tx.executeSql(query, [value, $rootScope.indexEtape], function (tx, res) {
              //console.log("updateDataSteepTableVisited rowsAffected: " + res.rowsAffected);
              //console.log("row is " + JSON.stringify(res.rows.item(0)));
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            db.close(function () {
              //console.log('updateDataSteepTableVisited database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.updateDataSteepTableWin = function($q, $rootScope, $scope, visitor) {
    //console.log('updateDataSteepTableWin : indexEtape : ' + $rootScope.indexEtape);
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady12, false);

// Cordova is ready
    function onDeviceReady12() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
          if (visitor=="child") {
            var query = "UPDATE steep_table SET winChild=?, winMessageChild=? WHERE id=?";
          }
          else {
            var query = "UPDATE steep_table SET winAdult=?, winMessageAdult=? WHERE id=?";
          }

          //console.log("String($scope.win[$rootScope.indexEtape] : " + String($scope.win[$rootScope.indexEtape]));
            tx.executeSql(query, [String($scope.win[$rootScope.indexEtape]), $scope.winMessage[$rootScope.indexEtape], $rootScope.indexEtape], function (tx, res) {
              //console.log("updateDataSteepTableWin rowsAffected: " + res.rowsAffected);
              //console.log("row is " + JSON.stringify(res.rows.item(0)));
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject updateDataSteepTableWin')
              );
            });
          }
          , function () {
            // OK to close here:
            db.close(function () {
              //console.log('updateDataSteepTableWin database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject updateDataSteepTableWin')
        );
      });
    }
    return deferred.promise;
  };


  this.updateAllDataSteepTableToFalse = function($q) {
    //console.log('updateAllDataSteepTableToFalse');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady11, false);

// Cordova is ready
    function onDeviceReady11() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "UPDATE steep_table SET visited=?";
            tx.executeSql(query, ["false"], function (tx, res) {
              //console.log("updateAllDataSteepTableToFalse rowsAffected: " + res.rowsAffected);
              //console.log("row is " + JSON.stringify(res.rows.item(0)));
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            db.close(function () {
              //console.log('updateAllDataSteepTableToFalsee database is closed ok');
             // deferred.resolve(
              // console.log('defered resolve updateAllDataSteepTableToFalse')
              // );
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.selectDataMainTable = function($q, $rootScope) {
    //console.log('selectDataMainTable');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady8, false);

// Cordova is ready
    function onDeviceReady8() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM main_table;", [], function (tx, res) {
              // tx.executeSql("select count(id) as cnt from main_table;", [], function(tx, res) {
              //   console.log("res.rows.length: " + res.rows.length + " -- should be 1");
              //   console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
              for (var i=0; i < res.rows.length; i++){
                row = res.rows.item(i);
                //console.log("row is " + JSON.stringify(row));
              }
              $rootScope.indexEtape = res.rows.item(0).etape;
              $rootScope.score_enfant = res.rows.item(0).score_enfant;
              $rootScope.score_adulte = res.rows.item(0).score_adulte;
              $rootScope.type_parcours = res.rows.item(0).type_parcours;
              $rootScope.map_loaded = res.rows.item(0).map_loaded;
              //console.log("selectDataMainTable etape : " + $rootScope.indexEtape + " score enfant : " + $rootScope.score_enfant
              //  + " score adulte : "  + $rootScope.score_adulte + " type parcours : " + $rootScope.type_parcours + " map_loaded : " + $rootScope.map_loaded);
            });
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction selectDataMainTable ok');
            db.close(function () {
              //console.log('selectDataMainTable database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };

  this.selectDataSteepTableVisited = function($q, $rootScope) {
    //console.log('selectDataSteepTableVisited');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady9, false);

// Cordova is ready
    function onDeviceReady9() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
          //  var query = "SELECT * FROM steep_table WHERE id=?";
          //tx.executeSql(query, [$rootScope.indexEtape], function (tx, res) {
            var query = "SELECT * FROM steep_table";
            tx.executeSql(query, [], function (tx, res) {
              // tx.executeSql("select count(id) as cnt from main_table;", [], function(tx, res) {
              //   console.log("res.rows.length: " + res.rows.length + " -- should be 1");
              //   console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
              for (var i=0; i < res.rows.length; i++){
                row = res.rows.item(i);
                //console.log("row is " + JSON.stringify(row));
                $rootScope.dataEtape.etape[i+1].visited = row.visited;
                //console.log("$rootScope.dataEtape.etape[i].visited : " + $rootScope.dataEtape.etape[i+1].visited);
              }

            //  console.log("selectDataSteepTableVisited etape : "+ res.rows.item($rootScope.indexEtape).id + " visited : " + res.rows.item($rootScope.indexEtape-1).visited);
            });
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject selectDataSteepTableVisited')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction selectDataSteepTableVisited ok');
            db.close(function () {
              //console.log('selectDataSteepTableVisited database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject selectDataSteepTableVisited')
        );
      });
    }
    return deferred.promise;
  };

  this.selectDataSteepTableWin = function($q, $scope, visitor) {
    //console.log('selectDataSteepTableWin');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady13, false);

// Cordova is ready
    function onDeviceReady13() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "SELECT * FROM steep_table";
            tx.executeSql(query, [], function (tx, res) {
              // tx.executeSql("select count(id) as cnt from main_table;", [], function(tx, res) {
              //   console.log("res.rows.length: " + res.rows.length + " -- should be 1");
              //   console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
              for (var i=0; i < res.rows.length; i++){
                row = res.rows.item(i);
                //console.log("row is " + JSON.stringify(row));
                if (visitor=="child") {
                  //$scope.win[row.id] = Boolean(row.winChild); // converti tout en true
                  // donc méthode employée ci-après
                  if (row.winChild=="true") {
                    $scope.win[row.id]=true;
                  }
                  else {
                    $scope.win[row.id]=false;
                  }
                  $scope.winMessage[row.id] = row.winMessageChild;
                }
                else {
                  //$scope.win[row.id] = Boolean(row.winAdult); // converti tout en true
                  // donc méthode employée ci-après
                  if (row.winAdult=="true") {
                    $scope.win[row.id]=true;
                  }
                  else {
                    $scope.win[row.id]=false;
                  }
                  $scope.winMessage[row.id] = row.winMessageAdult;
                }

                //console.log("win : " + $scope.win[row.id] + " / winMessage : " + $scope.winMessage[row.id]);
              }
            });
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject selectDataSteepTableWin')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction selectDataSteepTableWin ok');
            db.close(function () {
              //console.log('selectDataSteepTableWin database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject selectDataSteepTableWin')
        );
      });
    }
    return deferred.promise;
  };

  this.testGameFinished = function($q, $rootScope) {
    //console.log('testGameFinished');
    var deferred = $q.defer();
    // Wait for Cordova to load
    document.addEventListener('deviceready', onDeviceReady10, false);

// Cordova is ready
    function onDeviceReady10() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "SELECT * FROM steep_table";
            var finish=true;
            tx.executeSql(query, [], function (tx, res) {
              for (var i=0; i < res.rows.length; i++){
                row = res.rows.item(i);
                //console.log("row is " + JSON.stringify(row));
                if (row.visited=="false") {
                  finish=false;
                }
              }
              $rootScope.finish=finish;
            });
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction testGameFinished ok');
            db.close(function () {
              //console.log('testGameFinished database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          //console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };


  this.deleteData = function($q, $rootScope) {
    // Wait for Cordova to load
    //console.log('deleteData');
    var deferred = $q.defer();

    document.addEventListener('deviceready', onDeviceReady10, false);

// Cordova is ready
    function onDeviceReady10() {
      var db = window.sqlitePlugin.openDatabase({name: "cpiehl.db", iosDatabaseLocation: 'default'}, function (db) {
        db.transaction(function (tx) {
            var query = "DELETE * FROM main_table WHERE id=?";
            tx.executeSql(query, [$scope.id], function (tx, res) {
              //console.log("insertId: " + res.insertId + " -- probably 1");
              //console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
            })
          }, function (e) {
            //console.log("ERROR: " + e.message);
            // OK to close here:
            db.close(function () {
              deferred.reject(
                //console.log('deffered reject')
              );
            });
          }
          , function () {
            // OK to close here:
            //console.log('transaction ok');
            db.close(function () {
              //console.log('database is closed ok');
              deferred.resolve(true);
            });
          });

      }, function (err) {
        //console.log('Open database ERROR: ' + JSON.stringify(err));
        deferred.reject(
          console.log('deffered reject')
        );
      });
    }
    return deferred.promise;
  };
}
