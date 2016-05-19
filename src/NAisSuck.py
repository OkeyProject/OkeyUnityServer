#!/usr/bin/env python2.7
import json
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(("140.113.123.225", 7975))
sock.listen(10)

while True:
    conn, addr = sock.accept()

    conn.send("The error msg is fucking annoying, I want to close the server until I demo the fucking NA hw on Wed.")
    conn.close()
