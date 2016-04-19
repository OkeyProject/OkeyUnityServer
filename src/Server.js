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
        return JSON.stringify({state: 0, error: msg});
    }

    var server = Net.createServer(function(socket){
        socket.on('connect', function(){
            console.log("Connected from "+socket.remoteAddress+":"+socket.remotePort);
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
