#!/bin/bash
cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh
FILE="/tmp/dbResult"
TMP_FILE="/tmp/checkTmpFile"

mongo brahma_website --eval "printjson(db.vm_models.find().toArray())" &> $FILE
parseJSON $FILE
echo "$x" | jq -r '.[]|"\(.MAC) , \(.IP)"' $FILE > $TMP_FILE
sed -i 's/ //g' $TMP_FILE

exec < $TMP_FILE
while read line
do
  echo $line
done

clean

exit

R=`ps auxw | grep "$1" | grep -v grep | grep -v bash | grep ssh | head -n 1 `
Local_PID=`echo $R | awk '{print $2}'`
HOST=`echo $R | awk '{print $12}'`

Remote_PID=`ssh $HOST "ps auxw | grep $1 | grep -v bash| grep -v grep | grep -v ssh | awk '{print \\\$2}'"`

# kill local process
kill -9 $Local_PID

# kill remote process 
ssh $HOST "kill -9 $Remote_PID"

update_vm_record "Stop" "$1" "" ""
