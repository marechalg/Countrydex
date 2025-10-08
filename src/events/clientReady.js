const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fs = require('node:fs');
const vibrant = require('node-vibrant');
const moment = require('moment');

const { adlog, m, h } = require('../functions');

const countries = require('../../data/countries.json');
const { emojis } = require('../../data/utils.json');
const { spawnDelay, backupDelay } = require('../../data/config.json');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(args, client) {
        adlog('log', 'discord', `Connected to ${client.user.tag}`);

        let actual = moment.now();

        const updatePresenceInterval = setInterval(() => {
            let goal = actual + h(spawnDelay);
            let remainingTime = Math.round((goal - moment.now()) / 60000);
        
            client.user.setPresence({
                activities: [{ name: `${remainingTime} min`, type: ActivityType.Custom, state: `Spawning in ${remainingTime} min` }]
            });
        }, m(1));
        
        const spawnInterval = setInterval(() => {
            let goal = actual + h(backupDelay);
        
            client.channels.cache.filter(chnl => chnl.name.toLowerCase().includes('spawning')).forEach(spawn => {
                let data = JSON.parse(fs.readFileSync('data/spawns.json'));
                if (spawn.lastMessage) {
                    if (!data[spawn.id].solved) {
                        spawn.lastMessage.delete();
                    }
                }
        
                const country = countries[Math.floor(Math.random() * countries.length)];
        
                new vibrant(`https://flagpedia.net/data/flags/w1160/${country.code}.jpg`).getPalette().then(p => {
                    const color = p.Vibrant.hex;
                    const embed = new EmbedBuilder()
                        .setImage(`https://flagpedia.net/data/flags/w1160/${country.code}.webp`)
                        .setColor(color);
                    const button = new ButtonBuilder()
                        .setCustomId('guess_button')
                        .setLabel('Guess')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(`${emojis.MAG}`);
                    const row = new ActionRowBuilder().addComponents(button);
        
                    data[spawn.id] = { name: country.name, code: country.code, color: color, messageId: spawn.id, solved: false };
                    fs.writeFileSync('data/spawns.json', JSON.stringify(data, null, 4));
        
                    spawn.send({ embeds: [embed], components: [row] });
                });
            });
        
            if (moment.now() >= goal) {
                data = JSON.parse(fs.readFileSync('data/countrydexs.json'));
                fs.writeFileSync('data/backup/countrydexs.json', JSON.stringify(data, null, 4));
                actual = moment.now();
            }
        }, h(spawnDelay));
    }
}