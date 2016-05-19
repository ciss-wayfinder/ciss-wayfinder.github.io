#!/bin/bash


echo 'Uploading updated version...'
scp ~/Desktop/Wayfinder.zip pi@192.168.1.109:/home/pi/repo/
echo 'Updating pi...'
ssh pi@192.168.1.2 'sh ~/reboot.sh'
echo 'Removing Wayfinder.zip from local machine...'
rm -rf ~/Desktop/Wayfinder.zip
echo 'Wayfinder reboot in progress...'
