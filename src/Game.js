var exports = module.exports = {};
var Mysql = require('./MysqlConnection.js');
var GameCards = require('./GameCards.js');
var Async = require('async');

var Game = function(){
    if(!(this instanceof Game)){
        return new Game();
    }
    
    var Deal = function(gameId, playersId, callback){
        var gameCards = new GameCards(gameId);
        var cardToDeal = gameCards.StackDraw(56, function(cardToDeal){
            var playersCard = [[],[],[],[]];
            for(var i=0; i<14; i++){
                for(var playerNum=0; playerNum<4 ;playerNum++){
                    playersCard[playerNum].push(cardToDeal.pop());
                }
            }
            var allPlayer = [];
            for(var i=0;i<4;i++){
                var playerHand = [[],[]];
                for(var j=0;j<12;j++){
                    playerHand[0].push(playersCard[i].pop());
                    playerHand[1].push({color:'empty',number: 0});
                }
                playerHand[1][0] = playersCard[i].pop();
                playerHand[1][1] = playersCard[i].pop();
                
                var data = {hand: JSON.stringify(playerHand)};
                var cond = "game_id="+gameId+" AND player_id='"+playersId[i]+"'";

                allPlayer[i] = {};
                allPlayer[i]['data'] = data;
                allPlayer[i]['cond'] = cond;

            }

            var mysql1 = new Mysql();
            mysql1.Update("player", allPlayer[0]['data'], allPlayer[0]['cond'], function(err){
                var mysql2 = new Mysql();
                if(err) return callback(err);
                mysql2.Update("player", allPlayer[1]['data'], allPlayer[1]['cond'], function(err){
                    var mysql3 = new Mysql();
                    if(err) return callback(err);
                    mysql3.Update("player", allPlayer[2]['data'], allPlayer[2]['cond'], function(err){
                        var mysql4 = new Mysql();
                        if(err) return callback(err.toString());
                        mysql4.Update("player", allPlayer[3]['data'], allPlayer[3]['cond'], function(err){
                            return callback(err);
                        });
                    });
                });
            });

        });
    }

    var OrderUpdate  = function(gameId, callback){
        var orderUpdateSql = new Mysql();
        orderUpdateSql.Update("game",{current_order: 1}, "game_id="+gameId, function(err){
            return callback(err);
        });
        
    };

    var DiscardInit = function(gameId, callback){
        var mysql = new Mysql();
        data = {
            p1: '[]',
            p2: '[]',
            p3: '[]',
            p4: '[]'
        };
        mysql.Update("discard", data, "game_id="+gameId, function(err){
            return callback(err);
        });
    };

    var GetCurrentOrder = function(gameId, callback){
        var mysql = new Mysql();
        mysql.Select("game", ["current_order"], "game_id="+gameId,function(err, results){
            callback(err, results);
        });
    }


    var GetPlayerCard = function(gameId, playerOrder, callback){
        var mysql = new Mysql();
        mysql.Select("player", ['hand'], "game_id="+gameId+" AND player_order="+playerOrder, function(err, hand){
            if(err) {
                return callback(err, null, null)
            } else {
                //console.log("Current Player: "+playerOrder);
                var discardSql = new Mysql();
                var lastPlayerOrder = playerOrder===1?4:playerOrder-1;
                var col = "p"+lastPlayerOrder;
                discardSql.Select("discard", [col], "game_id="+gameId, function(err, discard){
                    if(err){
                        callback(err, null, null);
                        //throw err;
                    } else {
                        var cards = JSON.parse(discard[0]['p'+lastPlayerOrder]);
                        if(discard.length == 0){
                            callback(new Error("Can's get discard"), hand, discard);
                        } else if(cards.length == 0){
                            callback(err, JSON.parse(hand[0]['hand']), {color: "empty", number: 0});
                        } else{
                            callback(err, JSON.parse(hand[0]['hand']), cards.pop());
                        }
                    }
                });
            }
        });

    }

    var ShrinkArray = function(arr){
        var newArr = [];
        for(var i = 0, arrNum = arr.length; i < arrNum; i++){
            for(var j = 0, arrLen = arr[i].length; j<arrLen; j++){
                newArr.push(arr[i][j]);
            }
        }

        return newArr;
    }

    var SearchElement = function(arr, element){
        for(var i = 0, max = arr.length; i < max; i++){
            if(arr[i]['color'] === element['color'] && arr[i]['number'] === element['number']){
                return i;
            }
        }
        return -1;
    }

    that = {};
    
    that.Start = function(gameId,callback){
        var mysql = new Mysql();
        mysql.Select("player", ["player_id"], "game_id="+gameId,function(err, results){
            if(err){ 
                //throw err;
                return callback(err);
            }else{
                if(results.length != 4) callback(new Error("No enough player"));
                var playersId = [];
                console.log(results);
                for(var i in results){
                    playersId.push(results[i]['player_id']);
                }
                Deal(gameId,playersId, function(err){
                    if(err) return callback(err);
                    OrderUpdate(gameId, function(err){
                        if(err) {
                            //throw err;
                            return callback(err);
                        }
                        DiscardInit(gameId, function(err){
                            if(err) throw err;
                            return callback(err);
                        });
                    });
                });
            }
        });
    }
    
    that.CurrentPlayer = function(gameId, callback){
        GetCurrentOrder(gameId, function(err, results){
            if(err){
                return callback(err, null);
            } else {
                if(results.length == 0){
                    return callback(new Error("Can't get order",""));
                } else{
                    return callback(err, results[0]['current_order']);
                }
            }
        });
    }

    that.GetCurrentState = function(gameId, callback){
        that.CurrentPlayer(gameId, function(err, currentPlayer){
            if(err) throw err;
            GetPlayerCard(gameId, currentPlayer, function(err, hand, discard){
                if(err){
                    return callback(err, null, null);
                } else{
                    callback(err, currentPlayer, hand, discard);
                }
            });
        });
    }

    that.NextState = function(gameId, callback){
        that.CurrentPlayer(gameId, function(err, currentPlayer){
            if(err){
                return callback(err, null);
            } else {
                var mysql = new Mysql();
                console.log("Player "+currentPlayer+"is over");
                var nextPlayerOrder = currentPlayer==4? 1:currentPlayer+1;
                console.log("Next player: "+currentPlayer);
                mysql.Update("game", {current_order: nextPlayerOrder}, "game_id="+gameId, function(err){
                    return callback(err);
                });
            }
        });
    }

    that.DrawCard = function(gameId, callback){
        var gameCards = new GameCards(gameId);
        if(!gameCards.IsStackEmpty()){
            gameCards.StackDraw(1, function(drawedCard){
                that.GetCurrentState(gameId, function(err, currentPlayer, hand, discard){
                    hand[1].push(drawedCard[0]);
                    var mysql = new Mysql();
                    mysql.Update("player", {hand:JSON.stringify(hand)}, "game_id="+gameId+" AND player_order="+currentPlayer, function(err){
                        if(err) return callback(err, null);
                        callback(err, drawedCard[0]);
                    });
                });
            });
        } else {
            callback(new Error("CardStack is Empty"), null);
        }
    }   

    that.ThrowCard = function(gameId, newHand, callback){
        that.GetCurrentState(gameId, function(err, currentPlayer, hand, discard){
            if( err ){
                return callback(err);
            } else { 
                if(hand[1].length == 12){
                    if(discard['number'] > 0){
                        hand[1].push(discard);
                    } else{
                        throw new Error("No deal and no discard");
                    }
                }
                
                var oldHand = ShrinkArray(hand);
                var cmpHand = ShrinkArray(newHand);
                for(var i=0, max=cmpHand.length; i< max; i++){
                    var elementId = SearchElement(oldHand, cmpHand[i]);
                    if(elementId >= 0){
                        oldHand.splice(elementId, elementId+1);
                    } else{
                        return callback(new Error("Illegal element"+JSON.stringify(cmpHand[i])));
                    }
                }

                if(oldHand.length === 1){
                    var mysql = new Mysql();
                    mysql.Update("player",{hand:JSON.stringify(newHand)},"game_id="+gameId+" AND player_order="+currentPlayer,function(err){
                        
                        Async.waterfall([
                            function(callback){
                                var discardSelectSql = new Mysql();
                                var colStr = "p"+currentPlayer;
                                discardSelectSql.Select("discard", [colStr], "game_id="+gameId, function(err, results){
                                    callback(null, JSON.parse(results[0][colStr]));
                                    console.log(results);
                                });
                            }, function(result ,callback){
                                var discardUpdateSql = new Mysql();
                                var colStr = "p"+currentPlayer;
                                var discardItem = oldHand[0];
                                discardItem['taken'] = false;
                                result.push(discardItem);

                                var updateData = {};
                                updateData[colStr] = JSON.stringify(result);
                                discardUpdateSql.Update("discard", updateData, "game_id="+gameId,  function(err){
                                    callback(null);
                                });
                            }
                        ],
                        function(){
                            that.NextState(gameId, function(err){
                                return callback(err, oldHand[0]);
                            });
                        });
                        
                    });
                } else{
                    return callback(new Error("Compare card failed"));
                }
            }
        });
    }

    that.TakeDiscard = function(gameId, currentPlayer,callback){
        var mysql = new Mysql();
        var colStr = "p"+currentPlayer;
        mysql.Select("discard", [colStr], "game_id="+gameId, function(err, results){
            var colStr = "p"+currentPlayer;
            var updateData = {};
            var currentData = JSON.parse(results[0][colStr]);
            
            currentData[currentData.length-1]['taken'] = true;
            updateData[colStr] = JSON.stringify(currentData);

            var updateSql = new Mysql();
            updateSql.Update("discard", updateData, "game_id="+gameId, function(err){
                callback(err);
            });

        });
    }

    return that;

};
module.exports = Game;
