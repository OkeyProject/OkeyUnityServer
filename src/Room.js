var exports = module.exports = {};
var Mysql = require('./MysqlConnection.js');
var CardStack = require('./CardStack.js');

var Room = function(roomType){

    if (!(this instanceof Room)){
        return new Room();
    }
    var that = {};
    
    var GameIdGenerate = function(){
        var _sym = '1234567890';
        var str = '';
        var date = new Date();
        str += date.getFullYear().toString(); 
        str += date.getDate().toString();
        str += date.getHours().toString();
        str += date.getMinutes().toString();
        str += date.getSeconds().toString();
        for(var i = 0, idLen = 3; i < idLen; i++){
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }

        return str;
    }

    var PlayerIdGenerate = function(){
        var _sym = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        var str = '';
        for (var i =0, idLen = 20; i<idLen; i++){
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }
        return str;
    }

    var gameId = GameIdGenerate();
    var playerId;
    var mysql = new Mysql();
    
    var InsertGameInfo = function(gameId, callback){
        var mysql = new Mysql();
        var cardStack = new CardStack();   
        var data = {
            game_id : gameId,
            cardstack: JSON.stringify(cardStack.__stack),
            p1_id: PlayerIdGenerate(),
        };
        mysql.Insert("game", data, function(err, results){
            if(err) throw err;
            return callback(err, gameId, data['p1_id']);
        });
    }
    
    var InsertPlayerInfo = function(gameId, callback){
        var mysql = new Mysql();
        var cols = ["p1_id", "p2_id", "p3_id", "p4_id"];
        mysql.Select("game", cols, "game_id="+gameId, function(err, results){
            if(err) throw err;
            if(results.length == 0){
                //throw new Error("Wrong game id");
                return callback("Wrong game id", null, null);
            }
            
            var emptyPlayer = false;
            var order = 1;
            for (var i in results[0]){
                if(results[0][i] == null){
                    var cbSql = new Mysql();
                    var data= {};
                    data[i] = PlayerIdGenerate();
                    playerId = data[i];
                    cbSql.Update("game", data, "game_id="+gameId,function(err, data, fields){
                        if (err) throw err;
                        return callback(err, playerId, order);
                    });
                    emptyPlayer = true;
                    break;
                }

                order++;
            }
            if(!emptyPlayer){
                //throw new Error("No space for another player");
                return callback("No space for another player",null , null);
            }
        });       
        
    }

    that.GetId = function(){
        return gameId;
    }

    that.CreateRoom = function(callback){
        InsertGameInfo(gameId, function(err, gameId, playerId){
            if(err) {
                return callback(err, null, null);
                //throw err;
            } else {
                var playerSql = new Mysql();
                var discardSql = new Mysql();
                var data = {
                    game_id : gameId,
                    player_id: playerId,
                    player_order: 1,
                };
                playerSql.Insert("player", data, function(err, results){
                    if(err) throw err;
                });
                discardSql.Insert("discard", {game_id: gameId}, function(err, results){
                    if(err) throw err;
                });
            }
            return callback(err, gameId, playerId);       
        });
    }

    that.JoinRoom = function(gameId, callback){
        InsertPlayerInfo(gameId, function(err, playerId, order){
            if(err) {
                //throw err;
                return callback(err, null);
            }else{
                var playerSql = new Mysql();
                var data = {
                    game_id: gameId,
                    player_id: playerId,
                    player_order: order
                }
                playerSql.Insert("player", data, function(err, results){
                    if(err) throw err;
                    return callback(err, playerId);
                });
            }
        });
    }

    that.LeaveRoom = function(playerNum ,gameId , callback){
        var mysql = new Mysql();
        var data = {};
        var colName = "p"+(playerNum+1).toString()+"_id";
        data[colName] = null;
        mysql.Update("game", data, "game_id="+gameId, function(err){
            if(err) throw err;
            callback(err);
        });
    }

    that.DeleteRoom = function(gameId, callback){
        var mysql = new Mysql();
        mysql.Delete("game", "game_id="+gameId, function(err){
            if(err) throw err;
            callback(err);
        });
    }

    return that;
};

module.exports = Room;
//var room = new Room();
/*room.CreateRoom(function(err, gameId, playerId){
    console.log(gameId+"  "+playerId);
});*/
/*room.JoinRoom(20163031557860, function(err, playerId){
    if(err){
        console.log(err);
    }else{
        console.log(playerId);
    }
});*/
