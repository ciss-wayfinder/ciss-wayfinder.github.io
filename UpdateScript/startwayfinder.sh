#!/bin/bash

export DISPLAY=:0

pids=( $(ps -ef | egrep 'chromium' | awk '{print $2}') )
if [ "${#pids[@]}" -gt 0 ]; then
  kill -9 "${pids[@]}";
fi

/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --allow-outdated-plugins --kiosk https://ciss-wayfinder.github.io &
unclutter &

