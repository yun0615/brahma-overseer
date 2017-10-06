function get_ip(){
  #GET_IP=`ssh tails@10.10.10.1 "tail -n 300 /var/log/syslog | grep -i "$1" | grep DHCPACK | tail -n 1 | awk '{print $8}'"`
  #GET_IP=`ssh tails@10.10.10.1 "tail -n 300 /var/log/syslog | grep -i "$1" | grep DHCPACK | tail -n 1 " | awk '{print $8}' `
  GET_IP=`tail -n 300 /var/log/syslog | grep -i "$1" | grep DHCPACK | tail -n 1 | awk '{print $8}' `
}

function update_vm_record(){
  MSG=$1
  MAC=$2
  IP=$3
  USERNAME=$4
  mongo brahma_website --eval "db.vm_models.update({\"MAC\":\"$2\"},{\$set:{\"IP\":\"$3\",\"User\":\"$4\",\"Status\":\"$1\"}})"
}

function update_vm_ip(){
  MAC=$1
  IP=$2
  MSG=$3
  mongo brahma_website --eval "db.vm_models.update({\"MAC\":\"$MAC\"},{\$set:{\"IP\":\"$IP\",\"Status\":\"$MSG\"}})"
}

function clean() {
  if [ -f $FILE ]; then
    rm -rf $FILE
  fi

  if [ -f $TMP_FILE ]; then
    rm -rf $TMP_FILE
  fi
}

function parseJSON() {
  FILE="$1"
  filename='/tmp/LINE'
  sed -i '/MongoDB/d' $FILE
  sed -i '/connecting/d' $FILE
  sed -i '/ObjectId/d' $FILE

  grep -n "}" $FILE | cut -d ":" -f 1 > $filename
  exec < $filename
  while read line
  do
    LINE_NUMBER=$(($line- 1))
    sed -i "${LINE_NUMBER}s/,//g" $FILE
  done
}

function get_count() {
  if [ -z $1 ]; then
    COUNT=0
  else
    COUNT=$1
  fi
}

function get_data() {
  #echo "Get Data"
  FILE="/tmp/FILE"
  mongo brahma_website --eval "printjson(db.vm_info.find().toArray())" > $FILE
  sed -i "/Mongo/d" $FILE
  sed -i "/connecting/d" $FILE
  sed -i "/ObjectId/d" $FILE
  RES=`jq '.[].virtual' $FILE`
  VIRTUAL_MACHINE=$RES

  Length=`echo $VIRTUAL_MACHINE | wc -c`
  if [ "$Length" == "2" ]; then
    VIRTUAL_MACHINE=0$VIRTUAL_MACHINE
  fi

  if [ -f $FILE ]; then
    rm -rf $FILE
  fi
}

function update_data() {
  Number=$(expr $1 + 1)
  #echo "[DEBUG] Number = $Number"
  mongo brahma_website --eval "db.vm_info.update({Machine_INFO:\"Start\"},{\$set:{\"virtual\":${Number}}});"  &> /dev/null
}

function insert_VM_data() {
  Number=$1
  MAC=$2
  echo "Number=$Number"
  echo "MAC=$MAC"
  CMD="qemu-system-x86_64 --enable-kvm -vga std -hda ${VM_HOME}/VM_${VIRTUAL_MACHINE}.img -smp 2 -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 2G -vnc :${VIRTUAL_MACHINE} &"
  mongo brahma_website --eval "db.vm_models.insert({VM_ID:\"VM_${Number}\",IP:\"\",MAC:\"${MAC}\",Status:\"Stop\",User:\"\",PID:\"\",CMD:\"$CMD\",ZONE:\"$3\"})" &> /dev/null
}

function generateMacAddress() {
  RANGE=255
  #set integer ceiling

  number=$RANDOM
  numbera=$RANDOM
  numberb=$RANDOM
  #generate random numbers

  let "number %= $RANGE"
  let "numbera %= $RANGE"
  let "numberb %= $RANGE"
  #ensure they are less than ceiling

  octets='00:60:2F'
  #set mac stem

  octeta=`echo "obase=16;$number" | bc`
  octetb=`echo "obase=16;$numbera" | bc`
  octetc=`echo "obase=16;$numberb" | bc`

  R=`echo $octeta | wc -c`
  if [ "$R" == "2" ]; then
    octeta=F$octeta
  fi

  R=`echo $octetb | wc -c`
  if [ "$R" == "2" ]; then
    octetb=F$octetb
  fi

  R=`echo $octetc | wc -c`
  if [ "$R" == "2" ]; then
    octetc=F$octetc
  fi

  #use a command line tool to change int to hex(bc is pretty standard)
  #they're not really octets.  just sections.

  MACADDRESS="${octets}:${octeta}:${octetb}:${octetc}"
  #concatenate values and add dashes

}

function copyImg(){
  cp $IMG_HOME/base.img $VM_HOME/VM_${1}.img
}

function runVM() {
  #ssh $1 qemu-system-x86_64 --enable-kvm -vga std -hda ${VM_HOME}/VM_${VIRTUAL_MACHINE}.img -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 1G -vnc :${VIRTUAL_MACHINE} &
  qemu-system-x86_64 --enable-kvm -vga std -hda ${VM_HOME}/VM_${VIRTUAL_MACHINE}.img -smp 2 -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 2G -vnc :${VIRTUAL_MACHINE} &
}

function checkZone() {
  COUNT_A=`ps auxw | grep qemu-system-x86_64 | grep $HOST_A | wc -l`
  COUNT_B=`ps auxw | grep qemu-system-x86_64 | grep $HOST_B | wc -l`

  if [ $COUNT_A -eq 8 ] && [ $COUNT_B -eq 8 ]; then
    ZONE=
    HOST=
    RUN="N"
  else
    if [ $COUNT_A -gt $COUNT_B ]; then
      ZONE="HOST_B"
      HOST=$HOST_B
    else
      ZONE="HOST_A"
      HOST=$HOST_A
    fi
  fi
}

function search_vm_ip() {

  FILE="/tmp/dbResult"
  TMP_FILE="/tmp/checkTmpFile"

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
      if [ -z $IP ]; then
        GET_IP=
        get_ip $MAC
          if [ ! -z $GET_IP ]; then
            update_vm_record "Running" "$MAC" "$GET_IP"
          else
            STATUS=RUN
          fi
      fi
    done
  
    if [ "$STATUS" == "NotRUN" ]; then
      break
    fi
  
    sleep 10
  
  done
  
  clean

}

function search_vm_ip_one() {

  FILE="/tmp/dbResult"
  TMP_FILE="/tmp/checkTmpFile"

  # Get Database VM count
  mongo brahma_website --eval "db.vm_models.count()" &> $FILE
  COUNT=`cat $FILE | tail -n 1`
  echo "Records count = $COUNT"
  Run_Time=1
  
  while true
  do
  
    echo "Run_Time=$Run_Time"
 #   STATUS=NotRUN
  
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
      if [ "$MAC" == "$1" ]; then
        if [ -z $IP ]; then
          GET_IP=
          get_ip $MAC
            if [ ! -z $GET_IP ]; then
              update_vm_record "Running" "$MAC" "$GET_IP"
              STATUS=NotRUN
            else
              STATUS=RUN
            fi
        else
          STATUS=NotRUN
        fi
      fi
    done
  
    if [ "$STATUS" == "NotRUN" ]; then
      break
    fi
  
    if [ "$Run_Time" == "20" ]; then
      echo "Run_Time to 20 times, break loop"
      break
    else
      Run_Time=$(( $Run_Time + 1 ))
    fi

    sleep 1
  
  done
  
  clean
}

function check_target_version() {
  local TARGET_IP="$1"
  local TARGET_PORT="$2"
  local CHECK_FILE="/tmp/check_devices"
  adb kill-server &> /dev/null
  if [ -z $TARGET_PORT ]; then 
    adb connect $TARGET_IP &> /dev/null
  else
    adb connect $TARGET_IP:$TARGET_PORT &> /dev/null
  fi

  adb devices > $CHECK_FILE 2> /dev/null
  sed -i '/^\s*$/d' $CHECK_FILE
  RES=`cat $CHECK_FILE | wc -l`

  if [ "$RES" != "1" ];then
   MODEL=`adb shell "uname -m" | dos2unix` 
  fi
  
  rm -rf $CHECK_FILE
}

