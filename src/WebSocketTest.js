var net = require('net');

var HOST = '140.113.123.225';
var PORT = 7975;
var sockets = [];
var server = net.createServer(function(socket){
    sockets.push(socket);
    console.log("Current sockets")
    for(var i=0 ;i<sockets.length; i++){
        console.log(sockets[i].remoteAddress+":"+sockets[i].remotePort);
        
    }
    
    socket.on('data', function(data){
        console.log("DATA: "+socket.remoteAddress + ":"+socket.remotePort+" => "+data);
        for(var i=0 ;i<sockets.length; i++){
            sockets[i].write(sockets[i].remoteAddress+":"+sockets[i].remotePort);
        }
        
    });

    socket.on('close', function(data){
        flag = false;
        console.log("Current Length: " + sockets.length);
        for(var i=0;i<sockets.length; i++){
            if(sockets[i].destroyed === true){
                if(sockets.length > 1)
                    sockets = sockets.splice(i, i+1);
                else    
                    sockets = [];
                console.log(i+" is deleted ")
                flag = true;
            }
        }
        if(!flag){
            console.log("Not found");
        }
        console.log("-------------------");
    });

    socket.on('error', function(){
    });
});

server.listen(PORT, HOST);
