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
        game.GetCurrentState(gameId, cont(err, currentPlayer, hand, discard));
        console.log(currentPlayer);
        console.log(hand);
        console.log(discard);
        game.DrawCard(gameId, cont(err, drawedCard));
        console.log(drawedCard);
        game.ThrowCard(gameId, hand, cont(err));
        console.log(err);
        game.GetCurrentState(gameId, cont(err, currentPlayer, hand, discard));
        console.log(currentPlayer);
        console.log(hand);
        console.log(discard);
    });
}

var code = main.toString();
var compiledCode = Continuation.compile(code);
//console.log(compiledCode);
eval(compiledCode);

main();
