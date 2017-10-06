#!/bin/bash
cd `dirname $0`
DIR=`pwd`

R=`ps auxw | grep "$1" | grep -v grep | head -n 1 `
Local_PID=`echo $R | awk '{print $2}'`
HD=`echo $R | awk '{print $16}'`

# kill local process
kill -9 $Local_PID

# kill remote process 
rm -rf $HD

exit

IMG=`ps auxw | grep qemu | grep -i "$1" | grep -v "grep" | awk '{print $16}'`
PID=`ps auxw | grep qemu | grep -i "$1" | grep -v "grep" | awk '{print $2}'`

#echo $IMG
#echo $PID

kill -9 $PID
rm -rf $IMG
