#!/bin/bash
cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh
FILE="/tmp/dbResult"
TMP_FILE="/tmp/checkTmpFile"
GET_IP=

mongo brahma_website --eval "printjson(db.vm_models.find().toArray())" &> $FILE
parseJSON $FILE
echo "$x" | jq -r '.[]|"\(.MAC) , \(.IP)"' $FILE > $TMP_FILE
sed -i 's/ //g' $TMP_FILE


exec < $TMP_FILE
while read line
do
  echo "========================"
  IP=`echo $line | cut -d "," -f 2`
  MAC=`echo $line | cut -d "," -f 1`
  ping -c 1 $IP &> /dev/null
  if [ "$?" != "0" ]; then
    update_vm_record "Stop" "$MAC" "" ""
  fi
done

clean
