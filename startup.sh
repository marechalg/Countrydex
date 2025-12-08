#!/bin/bash

sudo apt-get update
sudo apt-get upgrade -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install node

cd /home/rasp/Desktop/countrydex/Countrydex

git pull https://github.com/marechalg/Countrydex.git -f

npm init -y
npm i discord.js moment node-vibrant@valpha-3.2.1

cp /home/rasp/Desktop/countrydex/config.json /home/rasp/Desktop/countrydex/Countrydex/data/config.json

node .