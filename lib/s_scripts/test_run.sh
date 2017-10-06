#!/bin/bash
cd `dirname $0`
DIR=`pwd`
source brahma.property
source vmi_utils.sh

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
    echo "RUN"
    exit 0
  else
    echo "NotRUN"
    exit 0
  fi
fi
 
if [ "$1" == "server" ]; then
  RE=`netstat -tlnp | grep server.js | grep -w "$SERVER_PORT" | wc -l`
  if [ "$RE" == "1" ]; then
    echo "RUN"
    exit 0
  else
    echo "NotRUN"
    exit 0
  fi
fi

echo "Can't find service"
exit 1
