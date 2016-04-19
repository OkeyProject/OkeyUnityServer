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
                    if(data['action'] != "room"){
                        return socket.write(ErrMsg("Unknown action"));
                    } else if(data['command']!="create" && data['command']!="join" && data['command']!="random"){
                        return socket.write(ErrMsg("Unknown command "+data['command']));
                    } else{
                        var room = new Room();
                        if(data['command'] === "create"){
                            room.CreateRoom(function(err, gameId, playerId){
                                if(err){
                                    return socket.write(ErrMsg(err));
                                } else {
                                    var newServer = new GameServer(gameId);
                                    newServer.AddPlayer(socket, playerId);
                                    gameServers[gameId] = newServer;
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
