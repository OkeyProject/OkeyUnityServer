# Okey Server for Unity 3D develop
---
## Connection:
> connection with TCP socket
>> Host: 140.113.123.225
>>> Port: 7975

## Room Usage
    {
        action: "room",
        command: "create" | "join" | "random"
    }
    
### Create
    {
        action: "room",
        command: "create"
    }
    
### Join

* Send

        {  
            action: "room",
            command: "join",
            game_id: //the room id you want to join
        }

### random
Not yet complete

## Game Usage
### Start
Game would start automatically while four player are all connected.
### Game usage

