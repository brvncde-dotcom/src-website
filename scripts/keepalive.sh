#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
  node server.js &>/tmp/standalone.log &
  PID=$!
  echo "Started server PID: $PID"
  wait $PID
  echo "Server died, restarting in 2s..."
  sleep 2
done