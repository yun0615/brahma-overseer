#--------------------------------------------
#This script is run the qemu vm
#--------------------------------------------

cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh
VM_HOME="/root/brahma_backend/vm"
IMG_HOME="/root/brahma_backend/img"
VIRTUAL_MACHINE=
MACADDRESS=
COUNT=
ZONE=

for VARIABLE in `seq 1 10`
do
  RUN=
  checkZone
  if [ "$RUN" == "N" ]; then
    continue
  fi
  echo "$VARIABLE"
done
exit

get_count $1
# Run start process
for VARIABLE in `seq 1 $COUNT`
do
  get_data 
  generateMacAddress
  checkZone
  copyImg $VIRTUAL_MACHINE
  insert_VM_data $VIRTUAL_MACHINE $MACADDRESS $ZONE
  update_data $VIRTUAL_MACHINE
  runVM
  sleep 3
done

#bash $DIR/update_vm_ip.sh
search_vm_ip

