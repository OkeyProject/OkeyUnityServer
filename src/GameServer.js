var exports = module.exports = {};

var Room = require('./Room.js');
var Game = require('./Game.js');
var Async = require('async');

var GameServer = function(gameId){
    if(!(this instanceof GameServer)){
        return new GameServer(gameId);
    }

    var that = {};
    var boardcastDelay = 0;
    
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

    that.Boardcast = function(msg, callback){
        that.CheckAlive(function(isAlive, liveList,deadList){
            console.log("Alive: "+liveList.toString());
            if(isAlive){
                for(var i=0,max=liveList.length; i<max ;i++){ 
                    players[liveList[i]].socket.write(JSON.stringify({reply: 0, msg: msg}));
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
                that.Boardcast("Player "+(i+1).toString()+" join the game", function(){
                    players[i] = newPlayer;
                    that.CheckAlive(function(isAlive, liveList, deadList){
                        if(liveList.length === 4){
                            that.Start();
                        }
                    });
                });
                return true;
            }
        }
        return false;
        //newPlayer.socket.write("Waiting for game start...");
    }
    
    that.Start = function(){
        that.Boardcast("Game Start", function(){});
        var game = new Game();
        game.Start(gameId, function(){
            Async.waterfall([
                function(callback){
                    game.GetCurrentState(gameId, function(err,currentPlayer, hand, discard){
                        if(err) throw err;
                        else callback(null,currentPlayer, hand, discard);                   
                    });
                },
                function(currentPlayer, hand, discard, callback){
                    var writeData = {
                        reply: 1,
                        action: "get",
                        game_id: gameId,
                        hand: hand,
                        discard: discard,
                        msg: "Take or draw a new card."
                    }
                    players[currentPlayer-1].socket.write(JSON.stringify(writeData));
                }
            ],         
            function(err){
            });
        });
    }
    
    that.nextRound = function(){
        var game = new Game();
        game.GetCurrentState(gameId, function(err,currentPlayer, hand, discard){
            if(err) throw err;
            
            var writeData = {
                reply: 1,
                action: "get",
                game_id: gameId,
                hand: hand,
                discard: discard,
                msg: "Take or draw a new card."
            }
            players[currentPlayer-1].socket.write(JSON.stringify(writeData));
        });
    }

    return that;

}

module.exports = GameServer;
