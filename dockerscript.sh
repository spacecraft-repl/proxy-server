#!/bin/bash

docker run --memory=100m -it --cpus=".2" --runtime=runsc --expose=3000 -d proxy-fix

docker network inspect bridge

docker inspect --format '{{ .NetworkSettings.IPAddress }}' $(docker ps -q) | head -1
