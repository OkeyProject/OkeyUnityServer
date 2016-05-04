#!/bin/sh

ps aux | grep Server.js | grep -v grep | awk '{print $2}' | xargs kill -9
node /home/Justin/OkeyUnityServer/src/Server.js &
