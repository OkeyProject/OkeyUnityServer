var exports = module.exports = {};

var room = require('./Room.js');
var game = require('./Game.js');

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

    var Boardcast = function(msg){
        for(var i in players){
            i.socket.write(msg);
        }
    }

    var checkAlive = function(callback){
        var liveList = [];
        for(var i=0; i<4; i++){
            if(players[i]===null){
                continue;
            }

            if(players[i].socket.destroyed === true){
                players[i] = null;
            } else {
                liveList.push(i);
            }
        }
        
        if(liveList.length > 0){
            return callback(true, liveList);
        } else {
            return callback(false, []);
        }
        
    }

    that.AddPlayer = function(socket, id){
        var newPlayer = new player(socket, id);
        for(var i=0; i<4; i++){
            if(players[i] === null){
                players[i] = newPlayer;
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
