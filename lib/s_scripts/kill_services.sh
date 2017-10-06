#!/bin/bash
cd `dirname $0`
source brahma.property

if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi
 
if [ -z $1 ]; then
  echo "Mush give me a service"
  exit 1
fi
 
if [ "$1" == "overseer" ]; then
  RE=`netstat -tlnp | grep server.js | grep -w "$OVERSEER_PORT" | wc -l`
  if [ "$RE" == "1" ]; then
    echo "Running, stop it"
    $PM2 stop overseer
    exit 0
  else
    echo "No RUN, nothing to do"
    exit 0
  fi
fi
 
if [ "$1" == "server" ]; then
  RE=`netstat -tlnp | grep server.j | grep -w "$SERVER_PORT" | wc -l`
  if [ "$RE" == "1" ]; then
    echo "Running, stop it"
    $PM2 stop server
    exit 0
  else
    echo "No RUN, nothing to do"
    exit 0
  fi
fi

echo "Can't find service"
exit 1
