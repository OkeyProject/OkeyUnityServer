var exports = module.exports = {};

var Room = require('./Room.js');
var game = require('./Game.js');
var Promise = require('promise');

var GameServer = function(gameId){
    if(!(this instanceof GameServer)){
        return new GameServer(gameId);
    }

    var that = {};
    
    var players = [null,null,null,null];
    that.gameId = gameId;

    var player = function(socket, id){
        if(!(this instanceof player)){
            return new player(socket, id);
        }
        
        var thatPlayer = {};

        thatPlayer.socket = socket;
        thatPlayer.id =id;

        return thatPlayer;
    }
    
    that.CheckAlive = function(callback){
        var liveList = [];
        var deadList = [];
        for(var i=0; i<4; i++){
            if(players[i]===null){
                continue;
            }

            if(players[i].socket.destroyed === true){
                players[i] = null;
                deadList.push(i);
                var room = new Room();
                room.LeaveRoom(i, gameId, function(err){
                    if(err) throw err;
                });
            } else {
                liveList.push(i);
            }
        }
        
        if(liveList.length > 0){
            return callback(true, liveList, deadList);
        } else {
            return callback(false, [], deadList);
        }
        
    }

    var Boardcast = function(msg, callback){
        that.CheckAlive(function(isAlive, liveList){
            console.log("Alive: "+liveList.toString());
            if(isAlive){
                for(var i=0,max=liveList.length; i<max ;i++){ 
                    players[i].socket.write(JSON.stringify({reply: 0, msg: msg}));
                }
                return callback();
            }
            return callback();
        });
    }


    that.AddPlayer = function(socket, id){
        var newPlayer = new player(socket, id);
        for(var i=0; i<4; i++){
            if(players[i] === null){
                Boardcast("Player "+i+" join the game", function(){
                    players[i] = newPlayer;
                });
                return true;
            }
        }
        return false;
        //newPlayer.socket.write("Waiting for game start...");
    }
    
    that.RoomState = function(callback){
        
    }

    that.Start = function(){
        checkAlive(function(alive, liveList){
        });
    }

    return that;

}

module.exports = GameServer;
