#!/bin/bash
ID="C7_"
ID=$ID$2

if [ "$#" != "2" ];  then
  echo "Wrong"
fi

if [ "$1" == "on" ]; then
  mongo brahma_arm_cluster --eval "db.board.update({\"ID\":\"$ID\"},{\$set:{\"Status\":\"Running\"}})"
else
  mongo brahma_arm_cluster --eval "db.board.update({\"ID\":\"$ID\"},{\$set:{\"Status\":\"Stop\"}})"
fi
