var net = require('net');
var CardStack = require('./CardStack');
var mysql = require('./MysqlConnection.js');

var HOST = '140.113.123.225';
var PORT = 7975;

var server = net.createServer(function(sock){
    console.log('connection:', sock.remoteAddress+':'+sock.remotePort);
    sock.on('data', function(data){
        console.log('DATA:'+data);
        sock.write(data);
    });    
    
    sock.on('close', function(data){
        console.log('close');
    });

});


//server.listen(PORT, HOST);
