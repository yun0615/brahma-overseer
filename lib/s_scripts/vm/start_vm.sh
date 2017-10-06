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

mongo brahma_website --eval "printjson(db.vm_models.find().toArray())" &> $FILE
parseJSON $FILE
echo "$x" | jq -r '.[]|"\(.VM_ID) , \(.MAC) ,  \(.ZONE) , \(.CMD) "' $FILE > $TMP_FILE

exec < $TMP_FILE
while read line
do
  echo $line
  VM_ID=`echo $line | awk '{print $1}'`
  if [ "$VM_ID" == "$1" ]; then
    MACADDRESS=`echo $line | cut -d "," -f 2 | grep -o "[^ ]\+\( \+[^ ]\+\)*"`
    ZONE=`echo $line | cut -d "," -f 3 | grep -o "[^ ]\+\( \+[^ ]\+\)*"`
    VIRTUAL_MACHINE=`echo $VM_ID | cut -d "_" -f 2`
    runVM 
    break
  fi
done

clean

sleep 15
search_vm_ip_one $MACADDRESS
