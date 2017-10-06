#!/bin/bash
FILE="/tmp/FILE"
RES=

function get_data() {
  #echo "Get Data"
  mongo brahmap_website --eval "printjson(db.vm_info.find().toArray())" > $FILE
  sed -i "/Mongo/d" $FILE
  sed -i "/connecting/d" $FILE
  sed -i "/ObjectId/d" $FILE
  RES=`jq '.[].virtual' $FILE`
  echo $RES
  # jq '.Instances[0].ImageId' test.json
}

function update_data() {
  #echo "\$1=$1"
  # mongo --eval 'db.test.update({"name":"foo"},{$set:{"this":"that"}});'
  #echo "Get Data"
  #Number=$(($1 + 1))
  Number=$1
  #mongo brahma --eval 'db.vm_info.update({\"Machine_INFO\":\"RUN\"},{\$set:{\"VirtualMachine\":\"1\"}});'
  #mongo brahma --eval "db.vm_info.update({"VM_INFO":"RUN"},{\$set:{"Machine":$Number}})"
  mongo brahma_website --eval "db.vm_info.update({Machine_INFO:\"Start\"},{\$set:{\"virtual\":${Number}}});" &> /dev/null
}

#get_data
#update_data $RES
#get_data

if [ "$1" == "get" ]; then
  get_data
fi

if [ "$1" == "update" ]; then
  update_data $2
fi
