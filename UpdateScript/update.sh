#!/bin/bash

rsync --verbose --update --delete-after --progress --recursive WayfinderProject*.zip pi@192.168.1.109:/home/pi/repo/
