#!/bin/bash
cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh

IP="$1"
PORT="$2"
MODEL=

check_target_version $IP $PORT
if [ ! -z $MODEL ]; then
  echo $MODEL 
  if [ "$MODEL" == armv7l ]; then
    adb shell "reboot" &
  else
    #TODO implement android x86 reset function
    adb kill-server &> /dev/null
    echo "Android x86"
  fi
fi

