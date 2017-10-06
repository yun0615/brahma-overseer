CMD="qemu-system-x86_64 -vga std -hda /home/proces/brahma_website/vm/VM_01.img -device e1000,netdev=net0,mac=DE:AD:BE:EF:00:01 -netdev tap,id=net0 -m 1G --nographic"
$CMD &
#kill -9 0

PID=$!
echo $PID > /home/proces/brahma_website/pid.txt

exit
