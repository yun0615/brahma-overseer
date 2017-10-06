#--------------------------------------------
#This script is run the qemu vm
#--------------------------------------------

cd `dirname $0`
DIR=`pwd`
source ../brahma.property
source ../vmi_utils.sh
#VM_HOME="/root/brahma_backend/vm"
#IMG_HOME="/root/brahma_backend/img"
COUNT=

get_count $1

# Run start process
for VARIABLE in `seq 1 $COUNT`
do
  #ZONE=
  #HOST=
  MACADDRESS=
  VIRTUAL_MACHINE=
  RUN=
  #checkZone
  #if [ "$RUN" == "N" ]; then
  #  continue
  #fi
  get_data 
  generateMacAddress
  copyImg "$VIRTUAL_MACHINE"
  insert_VM_data $VIRTUAL_MACHINE $MACADDRESS "Local"
  update_data $VIRTUAL_MACHINE
  runVM 
  sleep 15
done

search_vm_ip

#echo $VIRTUAL_MACHINE
#echo $MACADDRESS

#CMD="qemu-system-x86_64 --enable-kvm -vga std -hda ${VM_HOME}/VM_${VIRTUAL_MACHINE}.img -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 1G -vnc :${VIRTUAL_MACHINE} &"
#echo $CMD

#*******************************************************
#uncomment following sentence if you just want to test assign the mac address.
#*******************************************************

#export MACADDRESS='DE:AD:BE:EF:00:01'
#export MACADDRESS=$1
#N=`echo $MACADDRESS | tail -c 2`

#*******************************************************
#uncomment following sentence if you want to random create the macaddress & put int gobal varable.
#*******************************************************

#export MACADDRESS=$(printf 'DE:AD:BE:EF:%02X:%02X\n' $((RANDOM%256)) $((RANDOM%256)))


#echo $MACADDRESS
#*******************************************************
#run qemu , and you can change -netdev to tap or user, the tap us mean you want to use a virtual network to use bridge network,and the user will use qemu NAT Server to assign 10.x.x.x ip to this qemy vm.
#*******************************************************
# workable
#qemu-system-x86_64 --enable-kvm -vga std -hda $2 -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 1G --nographic &

# Debug
#qemu-system-x86_64 --enable-kvm -vga std -hda $2 -device e1000,netdev=net0,mac=$MACADDRESS -netdev tap,id=net0 -m 1G -vnc :${N} &

# qemu-system-x86_64 --enable-kvm -monitor stdio -vga std -device e1000,netdev=net0,mac=fc:bb:14:a7:a8:01 -netdev tap,id=net0 -m 1G -hda vm/vm1.img  -vnc :0 -cdrom iso/patch_audio.iso

#qemu-system-x86_64 -vga std -hda /home/proces/brahma_website/vm/VM_01.img -device e1000,netdev=net0 -netdev user,id=net0 -m 1G --nographic

#qemu-system-x86_64 -vga std -hda /home/proces/brahma_website/vm/VM_01.img -device e1000,netdev=net0,mac=DE:AD:BE:EF:00:01 -netdev tap,id=net0 -m 1G --nographic

#PID=$!
#echo $PID > $3/$1.txt


