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
    
    var chkKey = function(data, key, limits){
        if(!(key in data)){
            return key+" is not specified.";
        }
        
        for(var i = 0, max = limits.length; i<max;i++){
            if(limits[i] === data[key]){
                return null;
            }
        }

        return "Unknown parameter "+datap[key];
    }

    var server = Net.createServer(function(socket){
        socket.on('data', function(data){
            var err = chkKey(data, "action", ['room', 'game']);
            if(err){
                socket.write(JSON.stringify({state: 0, error: err}));
            } else {
                var roomErr = chkKey(data, "command", ['create', 'join']);
                var gameErr = chkKey(data, "command", ['start','state', 'draw', 'throw']);

                if(roomErr != null && gameErr != null){
                    return socket.write(JSON.stringify({state: 0, error: roomErr}));
                } else if(roomErr ===null && gameErr === null){
                    return socket.write(JSON.stringify({state: 0, error: "too many actions"}));
                } else if(roomErr === null){
                    var room = new Room();
                    switch(data['command']){
                        case "create":
                            room.CreateRoom(function(err, gameId, playerId){
                                if(err){
                                    return socket.write(JSON.stringify({state: 0, error: err}));
                                } else{
                                    return socket.write({state: 1, game_id: gameId, player_id: playerId});
                                }
                            });
                            break;
                        case "join":
                            room.JoinRoom(data['game_id'], function(err, playerId){
                                if(err){
                                    return socket.write(JSON.stringify({state: 0, error: err}));
                                } else{
                                    return socket.write(JSON.stringify({state: 1, player_id: playerId}));
                                }
                            });
                            break;
                    }
                } else{
                    switch(data['command']) {
                    case "start":
                        break;
                    case "state":
                        break;
                    case "draw":
                        break;
                    case "throw":
                        break;
                    }
                
                }
                
            }
        });
    });

    that.Start = function(){
        server.listen(PORT, HOST);
    }

    return that;
}

module.exports = Server;
