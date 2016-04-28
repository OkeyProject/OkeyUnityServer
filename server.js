var net = require('net');
var CardStack = require('./src/Game.js');
var Room = require('./src/Room.js');

var HOST = '140.113.123.225';
var PORT = 7975;

var server = net.createServer(function(sock){
    console.log('connection:', sock.remoteAddress+':'+sock.remotePort);
    sock.on('data', function(data){
        var parsedData = JSON.parse(data);
        if(!("action" in parsedData)){
            sock.write(JSON.stringify({error: "no action is specified"}));
        } else if (parsedData['action'] === "room"){
            if()
        } else if (parsedData['action'] === "game"){
        
        } else{
            sock.write(JSON.stringify({error: "Unknown action"}));
        }
    });    
    
    sock.on('close', function(data){
        console.log('close');
    });

});


//server.listen(PORT, HOST);
