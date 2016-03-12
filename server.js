var http = require('http');
var server = http.createServer(function(){
    console.log("connection");
      
});

server.listen(8001);
