#!/bin/bash

exec >> /home/rasp/Desktop/countrydex/Countrydex.logs 2>&1

cd /home/rasp/Desktop/countrydex/Countrydex

git pull

node .