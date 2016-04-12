var exports = module.exports = {};

var HOST = "140.113.123.225";
var PORT = "7975";

var Game = require('./Game.js');
var Room = require('./Room.js');
var Net  = require('net');

var Server = function(){
    if(!(this instanceof Server)){
        return new Server();
    }

    var that = {};
    
    var ErrMsg = function(msg){
        return JSON.stringify({state: 0, error: msg});
    }

    var RoomCommand = function(data, callback){
        var game = new Game();
        if(!("command" in data)){
            callback(ErrMsg("No comman specified"), null, null);
        } else if(data['command'] === "create"){
            game.CreateRoom(function(err, gameId, playerId){
                if(err){
                    callback(err, null, null);
                } else {
                    callback(err, gameId, playerId);
                }
            });
        } else if(data['command'] === "join"){
            if(!("game_id" in data)){
                callback(ErrMsg("Game id required"), null, null);
            } else{
                game.JoinRoom(data['game_id'], function(err, playerId){
                    if(err){
                        callback(err, null, null);
                    } else {
                        callback(err, data['game_id'],playerId);   
                    }
                });
            }
        }
    }    

    var GameCommand = function(data, callback){
        
    }


    var server = Net.createServer(function(socket){
        socket.on('data', function(data){
            if(!("action" in data)){
                socket.write(ErrMsg("No action specified"));
            } else if(data['action'] === "room"){
                
            } else if(data['action'] === "game"){
                
            } else {
                socket.write(ErrMsg("Unknown action"));
            }
        });
    });

    that.Start = function(){
        server.listen(PORT, HOST);
    }

    return that;
}

module.exports = Server;
