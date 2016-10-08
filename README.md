# ipfs-reconnect
Reconnects/Restarts your node automatically if you are offline.

# Usage
```
Options:
  -i, --interval        Scan Interval                   [number] [default: 1000]
  -b, --binary          Path to IPFS binary           [string] [default: "ipfs"]
  -r, --restart         Allow restart                 [boolean] [default: false]
  -s, --restart-script  Path to restart script            [string] [default: ""]
  -m, --min-nodes       Minimum nodes online               [number] [default: 4]
  -p, --path            Path to IPFS repo [string] [default: "/home/user/.ipfs"]
  -h, --help            Show help                                      [boolean]

Copyright (C) 2015 Maciej Krüger
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

# Restart Script
Start the IPFS Daemon as background - the application will wait for the script to exit
#### Example Script (with ```screen```):
```
SCREEN="ipfs"
screen -X -S $SCREEN quit 2> /dev/null > /dev/null #kill if running
waitforstop() {
  screen -S $SCREEN -X alive 2> /dev/null > /dev/null
  if [ $? -eq 0 ]; then
    echo -n "."
    sleep .25s
    waitforstop $1
  else
    sleep .5s
  fi
}
if [ $? -eq 0 ]; then
  echo -n "stopping..."
  waitforstop $SCREEN
  echo "ok"
fi
which ipfs 2> /dev/null > /dev/null
if ! [ $? -eq 0 ]; then export PATH="/usr/local/bin/:$PATH"; fi #fix missing PATH location
echo -n "restarting..."
screen -dmS $SCREEN ipfs daemon #start
waitfor() {
  screen -S $SCREEN -X alive 2> /dev/null > /dev/null
  if [ $? -ne 0 ]; then
    echo "failed!"
    exit 2
  fi
  curl $1  --connect-timeout 1 -m 1 -s 2>/dev/null > /dev/null #try to load webui
  if [ $? -ne 0 ]; then
  echo -n "."
    sleep .25s
    waitfor $1
  else
    echo "ok"
    exit 0
  fi
}
waitfor "localhost:5001/webui"
```
