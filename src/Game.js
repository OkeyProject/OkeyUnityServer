var Mysql = require('./MysqlConnection.js');
var GameCards = require('./GameCards.js');

var Game = function(){
    if(!(this instanceof Game)){
        return new Game();
    }
    
    var Deal = function(gameId, playersId){
        var gameCards = new GameCards(gameId);
        var cardToDeal = gameCards.StackDraw(56, function(cardToDeal){
            var playersCard = [[],[],[],[]];
            for(var i=0; i<14; i++){
                for(var playerNum=0; playerNum<4 ;playerNum++){
                    playersCard[playerNum].push(cardToDeal.pop());
                }
            }
            for(var i=0;i<4;i++){
                var playerHand = [[],[]];
                for(var j=0;j<12;j++){
                    playerHand[0].push(playersCard[i].pop());
                    playerHand[1].push({color:'empty',number:'empty'});
                }
                playerHand[1][0] = playersCard[i].pop();
                playerHand[1][1] = playersCard[i].pop();
                
                var data = {hand: JSON.stringify(playerHand)};
                var cond = "game_id="+gameId+" AND player_id='"+playersId[i]+"'";
                var mysql = new Mysql();

                mysql.Update("player", data, cond, function(err){});
            }
        
        });
    }


    that = {};
    
    that.Start = function(gameId,callback){
        var mysql = new Mysql();
        mysql.Select("player", ["player_id"], "game_id="+gameId,function(err, results){
            if(err){ 
                throw err;
            }else{
                if(results.length != 4) throw new Error("No enough player");
                var playersId = [];
                for(var i in results){
                    playersId.push(results[i]['player_id']);
                }
                Deal(gameId,playersId);
                callback(err, results);
            }
        });
    }
    

    return that;

};

var game = new Game();
game.Start(20163031557860, function(err, results){
    if(err){
        throw new Error(err);
    } else{
        console.log(results.length);   
    } 
});
