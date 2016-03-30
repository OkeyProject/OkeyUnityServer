var Room = require('./Room.js');
var Game = require('./Game.js');

var Continuation = require('continuation');

var room = new Room();
var game = new Game();


function main(){
    room.CreateRoom(function(err, gameId, playerId){
        console.log(gameId);
        room.JoinRoom(gameId, cont(err, playerId));
        console.log(playerId);
        room.JoinRoom(gameId, cont(err, playerId));
        console.log(playerId);
        room.JoinRoom(gameId, cont(err, playerId));
        console.log(playerId);
        game.Start(gameId, cont(err));
    });
}

var code = main.toString();
var compiledCode = Continuation.compile(code);
console.log(compiledCode);
eval(compiledCode);

main();
