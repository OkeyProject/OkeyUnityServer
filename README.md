# Okey Server for Unity 3D develop
---
## Connection:
> connection with TCP socket
>> Host: 140.113.123.225
>>> Port: 7975

## Room Usage
```javascript
{
    action: "room",
    command: "create" | "join" | "random"
}
```
    
### Create
* Send
```javascript
{
    action: "room",
    command: "create"
}
```
* Receive
```javascript
{
    reply: 0,
    game_id: < game id >,
    player_id: < your player id >
}
```
### Join
* Send
```javascript
{  
    action: "room",
    command: "join",
    game_id: < the room id you want to join >
}
```
* Receive
```javascript
{
    reply: 0,
    game_id: < game id >,
    player_id: < your player id >
}
```
* Boardcast
```javascript
{
    reply: 0,
    msg: "Player <your number> join the game"
}
```
### random
Not yet complete

## Game Usage
```javascript
{
    action: "game",
    command: "take" | "draw" | "throw",
    game_id: < your game id >
}
```
### Start
Game would start automatically while four player are all connected.
If it is your turn, server would send message as below
```javascript
{
    reply: 1,
    action: "get",
    game_id: < your game id >,
    hand: < current cards in your hand >,
    discard: < discard from the last player  >, // if not exist, the color would be empty and number would be 0
    msg: "Take or draw a new card."
}
```
### Take
* Send
```javascript
{
    action: "game",
    command: "take",
    game_id: < your game id >
}
```
* Receive
```javascript
{
    reply: 1,
    action: "throw",
    get: < the card last player throw >,
    msg: "You choose to get last player's card, now choose which to throw"
}
```
* Boardcast
```javascript
{
    action: "take",
    player: < your order >,
    taken: < the card you take >
}
```
### Draw
* Send
```javascript
{
    action: "game",
    command: "draw",
    game_id: < your game id >
}
```
* Receive
```javascript
{
    reply: 1,
    action: "throw",
    msg: "You choose to draw a new card, now choose which to throw",
    get: < the card is newly drawed >
}
```
* Boardcast
```javascript
{
    action: "draw"
    player: < your order >,
}
```
### Throw
* Send
```javascript
{
    action: "game",
    command: "draw",
    game_id: < your game id >
    hand: [ < the new status in your hand, system would > ]
}
```
* Receive
```javascript
//Nothing is sent back if no error
```
* Boardcast
```javascript
{
    action: "throw",
    player: < your order >,
    thrown: < the card you throw >
}
```
