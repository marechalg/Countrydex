const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fs = require('node:fs');
const vibrant = require('node-vibrant');
const moment = require('moment');

const { adlog, m, h, spawnTime, backupTime } = require('../functions');

const countries = require('../../data/countries.json');
const { emojis } = require('../../data/utils.json');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(args, client) {
        adlog('log', 'discord', `Connected to ${client.user.tag}`);

        const presenceInterval = setInterval(() => {
            const remainingTime = Math.round(spawnTime() / m(1));
            client.user.setPresence({
                activities: [{ name: `${remainingTime} min`, type: ActivityType.Custom, state: `Spawning in ${remainingTime} min` }]
            });
        }, m(1));

        function spawnCountry() {
            client.channels.cache.filter(chnl => chnl.name.toLowerCase().includes('spawning')).forEach(async spawn => {
                let data = JSON.parse(fs.readFileSync('data/spawns.json'));
                if (!data[spawn.id].solved) {
                    spawn.messages.fetch(data[spawn.id].messageId)
                        .then(msg => msg.delete())
                        .catch(() => {});
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

                    spawn.send({ embeds: [embed], components: [row] }).then(msg => {
                        data[spawn.id] = { name: country.name, code: country.code, color: color, messageId: msg.id, solved: false };
                        fs.writeFileSync('data/spawns.json', JSON.stringify(data, null, 4));
                    })
                });
            });
        }

        function backup() {
            const data = JSON.parse(fs.readFileSync('data/countrydexs.json'));
            fs.writeFileSync('data/backup/countrydexs.json', JSON.stringify(data, null, 4));
            adlog('log', 'fs', 'Nouvelle backup');
        }

        setTimeout(() => {
            spawnCountry();
            setInterval(spawnCountry, h(1));
        }, spawnTime());

        setTimeout(() => {
            backup();
            setInterval(backup, h(24));
        }, backupTime());
    }
}