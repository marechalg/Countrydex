#!/bin/bash

sudo apt-get update
sudo apt-get upgrade -y

cd /home/rasp/Desktop/countrydex/Countrydex

git pull

node .