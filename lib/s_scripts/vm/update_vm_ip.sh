#!/bin/bash
cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh
FILE="/tmp/dbResult"
TMP_FILE="/tmp/checkTmpFile"
GET_IP=
STATUS=

# Get Database VM count
mongo brahma_website --eval "db.vm_models.count()" &> $FILE
COUNT=`cat $FILE | tail -n 1`
echo "Records count = $COUNT"

while true
do

  STATUS=NotRUN

  mongo brahma_website --eval "printjson(db.vm_models.find().toArray())" &> $FILE
  parseJSON $FILE
  echo "$x" | jq -r '.[]|"\(.MAC) , \(.IP)"' $FILE > $TMP_FILE
  sed -i 's/ //g' $TMP_FILE


  exec < $TMP_FILE
  while read line
  do
    echo "========================"
    echo $line
    IP=`echo $line | cut -d "," -f 2`
    MAC=`echo $line | cut -d "," -f 1`
echo "IP=$IP"
echo "MAC=$MAC"
    if [ -z $IP ]; then
       STATUS=RUN
    fi
    if [ -z $MAC ]; then
       STATUS=RUN
    fi
    if [ -z $IP ]; then 
      GET_IP=
      get_ip $MAC
echo "GET_IP=$GET_IP"
        if [ ! -z $GET_IP ]; then
          update_vm_ip $MAC $GET_IP "Running"
        fi
    fi
  done

  if [ "$STATUS" == "NotRUN" ]; then
    break
  fi
  
  sleep 10

done

clean
