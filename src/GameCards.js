var exports = module.exports = {};
var Mysql = require('./MysqlConnection.js');

var GameCards = function(gameId){
    if (!(this instanceof GameCards)){
        return new GameCards(gameId);
    }
    
    var that = {};
    var isEmpty;

    that.StackDraw = function(cnt, callback){
        var mysql = new Mysql();
        mysql.Select("game", ["cardstack"], "game_id="+gameId, function(err, results){
            if(err){
                throw err;
            } else{
                var cardStack = JSON.parse(results[0]['cardstack']);
                var drawedCard = [];
                if(cardStack.length < cnt){
                    cnt = cardStack.length;
                }
                for(var i=0; i < cnt; i++){
                    drawedCard.push(cardStack.pop());
                }
                var drawedUpdateSql = new Mysql();
                drawedUpdateSql.Update("game", {cardstack: JSON.stringify(cardStack)}, "game_id="+gameId,function(err){});
                if(cardStack.length > 0){
                    isEmpty = false;
                } else{
                    isEmpty = true;
                }
                callback(drawedCard);
            }
        });
    }

    that.IsStackEmpty = function(){
        return isEmpty;
    }
    

    return that;
};

module.exports = GameCards;

var gameCard = new GameCards(201629143313912);

//gameCard.StackDraw(24);
