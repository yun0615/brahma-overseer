#!/bin/bash
#ssh tails@10.10.10.1 "tail -n 300 /var/log/syslog" | grep -i "$1" | grep DHCPACK | tail -n 1 | awk '{print $8}'
tail -n 300 /var/log/syslog |grep -i "$1" | grep DHCPACK | tail -n 1 | awk '{print $8}'

