#!/usr/bin/python2.7

import socket
import json


ADDR = ('140.113.123.225', 7975)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(ADDR)


a = {'action':'room', 'command':'create'}
b = {'action': 'room', 'command': 'join', 'game_id': 201619193519335}

gameId = 0
hand = {}

print(sock.recv(2048))
sock.send(json.dumps(a))
while True:
    data = sock.recv(2048)
    #print(data)
    data = json.loads(data)
    if data['reply'] == 0:
        continue
    else:
        if data['action'] == "get":
            c = {'action': 'game', 'command': 'draw', 'game_id':data['game_id']}
            print data['game_id']
            gameId = data['game_id']
            hand = data['hand']
            sock.send(json.dumps(c))
        elif data['action'] == "throw":
            d = {'action': 'game', 'command': 'throw', 'hand': json.dumps(hand), 'game_id': gameId}
            sock.send(json.dumps(d))



sock.close()
