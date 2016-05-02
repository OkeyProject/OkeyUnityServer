#!/usr/bin/python2.7

import socket
import json


ADDR = ('140.113.123.225', 7975)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(ADDR)

a = {'action':'room', 'command':'create'}
b = {'action': 'room', 'command': 'join', 'game_id': 201630164240401}

print(sock.recv(2048))
sock.send(json.dumps(b))
while True:
    data = sock.recv(2048)
    print(data)
    data = json.loads(data)
    if data['reply'] == 0:
        continue



sock.close()
