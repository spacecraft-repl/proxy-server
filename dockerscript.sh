#!/bin/bash

docker run --memory=100m -it --cpus=".2" --runtime=runsc --expose=3000 -d proxy-fix