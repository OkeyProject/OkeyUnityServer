#!/bin/bash
while true;
do
    id=`ps aux | grep "node /home/Justin/OkeyUnityServer/src/Server.js" | grep -v grep | awk '{print $2}'`
    sleep 30
    if [ -z $id ]; then 
        node /home/Justin/OkeyUnityServer/src/Server.js &
    fi

done
