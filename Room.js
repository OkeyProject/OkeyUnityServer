var exports = module.exports = {};
var Mysql = require('./MysqlConnection.js');
var CardStack = require('./CardStack.js');

var Room = function(roomType){

    if (!(this instanceof Room)){
        return new Room();
    }
    var that = {};
    
    var IdGenerate = function(){
        var _sym = '123456789';
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

    var id = IdGenerate();
    var mysql = new Mysql();
    
    var InsertGameInfo = function(id){
        var cardStack = new CardStack();   
        var data = {
            game_id : id,
            cardstack: JSON.stringify(cardStack.__stack),
            p1_id: 1
        };
        mysql.Insert("game", data, function(err, results){
            if(err) throw err;
            //console.log(results);
        });
    }

    
    that.GetId = function(){
        return id;
    }

    that.CreateRoom = function(callback){
        InsertGameInfo(id);
        return callback(id);
    }

    that.JoinRoom = function(id, callback){
        var cols = ["p1_id", "p2_id", "p3_id", "p4_id"];
        mysql.Select("game", cols, "game_id="+id, function(err, results){
            if(err) throw err;
            if(results.length == 0){
                return callback("Wrong game id");
            }
            
            var emptyPlayer = false;
            for (var i in results){
                if(results[i] == 0){
                    //update sql
                    emptyPlayer = true;
                    break;
                }
            }
            if(!emptyPlayer){
                return callback("No space for another player");
            } else{
                return callback(false);
            }
            console.log(results);
        });       
    }

    return that;
};

module.exports = Room;
