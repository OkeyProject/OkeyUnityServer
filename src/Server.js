var exports = module.exports = {};

var HOST = "140.113.123.225";
var PORT = "7975";

var Game = require('./Game.js');
var Room = require('./Room.js');
var Net  = require('net');
var GameServer = require('./GameServer.js');

var Server = function(){
    if(!(this instanceof Server)){
        return new Server();
    }

    var that = {};
    var gameServers = {};

    var ErrMsg = function(msg){
        return JSON.stringify({reply: 1, error: msg});
    }

    var server = Net.createServer();

    server.on('connection', function(socket){
        console.log("Connected from "+socket.remoteAddress+":"+socket.remotePort);
        socket.write(JSON.stringify({reply: 1, msg: "Welcome, please use commands create, join(with game id), or random."}), function(){
            socket.on('data', function(data){
                try{
                    data = JSON.parse(data);
                } catch(err){
                    socket.write(err);
                    return
                }
                console.log(data);
                if("action" in data && "command" in data){
                    if(data['action'] != "room" && data['action'] != "game"){
                        return socket.write(ErrMsg("Unknown action"));
                    } else if(data['action'] == "room"){
                        if(data['command']!="create" && data['command']!="join" && data['command']!="random"){
                            return socket.write(ErrMsg("Unknown command "+data['command']));
                        }

                        var room = new Room();
                        if(data['command'] === "create"){
                            room.CreateRoom(function(err, gameId, playerId){
                                if(err){
                                    return socket.write(ErrMsg(err));
                                } else {
                                    var newServer = new GameServer(gameId);
                                    newServer.AddPlayer(socket, playerId);
                                    gameServers[gameId] = newServer;
                                    console.log("create room: "+gameId);
                                    return socket.write(JSON.stringify({reply: 0, game_id: gameId, player_id: playerId}));
                                }
                            });
                        } else if(data['command']==="join"){
                            if("game_id" in data){
                                if(data['game_id'] in gameServers){
                                    gameServers[data['game_id']].CheckAlive(function(isAlive, liveList, deadList){
                                        if(deadList.length > 0){
                                            room.LeaveRoom(deadList[0], data['game_id'], function(err){
                                                if(err) return socket.write(ErrMsg(err));
                                                room.JoinRoom(data['game_id'], function(err, playerId){
                                                    if(err){
                                                        return socket.write(ErrMsg(err));
                                                    } else{
                                                        gameServers[data['game_id']].AddPlayer(socket, playerId);     
                                                        return socket.write(JSON.stringify({reply: 0, player_id: playerId}));
                                                    }
                                                });
                                            });
                                        } else{
                                            room.JoinRoom(data['game_id'], function(err, playerId){
                                                if(err){
                                                    return socket.write(ErrMsg(err));
                                                } else{
                                                    gameServers[data['game_id']].AddPlayer(socket, playerId);     
                                                    return socket.write(JSON.stringify({reply: 0, player_id: playerId}));
                                                }
                                            });
                                        }
                                    });
                                } else{
                                    return socket.write(ErrMsg("Game id not exist"));
                                }
                            } else {
                                return socket.write(ErrMsg("No game id specified"));
                            }
                        }
                    } else{
                        var game = new Game();
                        if(data['command'] != "take" && data['command'] != "draw" && data['command'] != "throw"){
                            return socket.write(ErrMsg("Unknown command"));
                        }

                        if(!("game_id" in data) || !(data['game_id'] in gameServers)){
                            return socket.write(ErrMsg("Game id not exist"));
                        }

                        if(data['command'] === "take"){
                            game.GetCurrentState(gameId, function(err, currentPlayer, hand, discard){
                                if(discard['number'] > 0){
                                    var writeData = {
                                        reply: 1,
                                        action: "throw",
                                        get: discard,
                                        msg: "You choose to get last player's card, now choose which to throw"
                                    }
                                    var boardcastData = {
                                        player: currentPlayer,
                                        action: "take",
                                        taken: discard
                                    }
                                    gameServers[gameId].Boardcast(boardcastData);

                                    return socket.write(JSON.stringify(writeData));
                                } else{
                                    return socket.write(ErrMsg("Last player have not discard yet"));
                                }
                            });   
                        } else if(data['command'] === "draw"){
                            game.GetCurrentState(data['game_id'], function(err, currentPlayer, hand, discard){
                                game.DrawCard(data['game_id'], function(err, drawedCard){
                                    if(err){
                                        return socket.write(ErrMsg(err));
                                    } else{
                                        var writeData = {
                                            reply: 1,
                                            action: "throw",
                                            get: drawedCard,
                                            msg: "You choose to draw a new card, now choose which to throw"
                                        }
                                        
                                        var boardcastData = {
                                            player: currentPlayer,
                                            action: "draw"
                                        }
                                        gameServers[data['game_id']].Boardcast(boardcastData, function(){});

                                        return socket.write(JSON.stringify(writeData));
                                    }
                                });
                            });
                        } else{
                            if(!("hand" in data)){
                                return socket.write(ErrMsg("No card to throw"));
                            }
                            game.GetCurrentState(data['game_id'], function(err, currentPlayer, hand, discard){
                                game.ThrowCard(data['game_id'], JSON.parse(data['hand']), function(err, thrownCard){
                                    if(err){
                                        console.log(err);
                                        return socket.write(ErrMsg(err));
                                    } else{
                                        var boardcastData = {
                                            player: currentPlayer,
                                            thrown: thrownCard
                                        }
                                        gameServers[data['game_id']].Boardcast(boardcastData, function(){});

                                        game.GetCurrentState(data['game_id'], function(err, currentPlayer, hand, discard){
                                            var writeData = {
                                                reply: 1,
                                                action: "get",
                                                game_id: data['game_id'],
                                                hand: hand,
                                                discard: discard,
                                                msg: "Take or draw a new card."
                                            }
                                            return gameServers[data['game_id']].nextRound();
                                        });
                                    }
                                });
                            });
                        }
                    }
                } else{
                    socket.write(ErrMsg("No action or command specified"));    
                }
            });

        });

        socket.on('error', function(){
            console.log("Error Occur");
        });

        socket.on('close', function(){
            console.log("Socket is closed");
            for(var i in gameServers){
                gameServers[i].CheckAlive(function(isAlive, liveList, deadList){
                    if(deadList.length > 0){
                        for(var j=0,max=deadList.length; j<max; j++){
                            deadList[j]++;
                        }
                        gameServers[i].Boardcast("Player "+deadList.toString()+" disconnected.", function(){});
                    }
                });
            }
        });
    });

    that.Start = function(){
        server.listen(PORT, HOST);
    }

    return that;
}

var server = new Server();
server.Start();

module.exports = Server;
