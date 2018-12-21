#!/bin/sh

while true
do
	ps auxw | grep http-proxy.js | grep -v grep > /dev/null

	if [ $? != 0 ]
	then
	  node ~/gooi/proxy-server/http-proxy.js > /dev/null
	fi
	sleep 5
done
