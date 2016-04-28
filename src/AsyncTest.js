var async = require('async');
var Game = require('./Game.js');
var Room = require('./Room.js');

var game= new Game();
var room = new Room();

async.waterfall([
    function(callback){
        room.CreateRoom(function(err, gameId, playerId){
            console.log("Game ID: "+gameId);
            console.log("Player 1: "+playerId);
            callback(null, gameId);
        });       
    },
    function(gameId, callback){
        var count = 0;
        async.whilst(
            function() {return count < 3},
            function(whileCb){
                room.JoinRoom(gameId, function(err, playerId){
                    console.log("Player "+(count+2).toString()+" : "+playerId);
                    count++;
                    whileCb(null);
                });
            },
            function(err){
                callback(null, gameId);
            }
        );
    },function(gameId, callback){
        game.Start(gameId, function(err){
            callback(null, gameId);
        });
    },function(gameId, callback){
    }
],function(err, result){

});
