const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fs = require('node:fs');
const vibrant = require('node-vibrant');

const { adlog, m, h, spawnTime, backupTime } = require('../functions');

const countries = require('../../data/countries.json');
const { emojis, colors } = require('../../data/utils.json');
const { SPAWN } = require('../../data/config.json');

let spawns = {};
try {
    spawns = JSON.parse(fs.readFileSync('data/spawns.json', 'utf8'));
} catch (e) {
    adlog('error', 'fs', `Impossible de lire spawns.json: ${e}`);
    spawns = {};
}

let savingSpawns = false;
let pendingSpawnsSave = false;

function saveSpawns() {
    if (savingSpawns) {
        pendingSpawnsSave = true;
        return;
    }
    savingSpawns = true;
    
    fs.writeFile('data/spawns.json', JSON.stringify(spawns, null, 4), 'utf8', (err) => {
        if (err) adlog('error', 'fs', err);
        savingSpawns = false;
        if (pendingSpawnsSave) {
            pendingSpawnsSave = false;
            saveSpawns();
        }
    });
}

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
            client.channels.cache
            .filter(chnl => chnl.name.toLowerCase().includes(SPAWN))
            .forEach(spawn => {
                const spawnId = spawn.id;
                
                if (spawns[spawnId] && !spawns[spawnId].solved) {
                    spawn.messages.fetch(spawns[spawnId].messageId)
                    .then(msg => msg.delete())
                    .catch(err => { adlog('error', 'json', err); });
                }
                
                const country = countries[Math.floor(Math.random() * countries.length)];
                
                new vibrant(`https://flagpedia.net/data/flags/w1160/${country.code}.jpg`)
                .getPalette()
                .then(pal => pal.Vibrant?.hex || colors.DEFAULT)
                .catch(err => {
                    adlog('error', 'node-vibrant', err);
                    return colors.DEFAULT;
                })
                .then(color => {
                    const embed = new EmbedBuilder()
                    .setImage(`https://flagpedia.net/data/flags/w1160/${country.code}.webp`)
                    .setColor(color);
                    const button = new ButtonBuilder()
                    .setCustomId('guess_button')
                    .setLabel('Guess')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${emojis.MAG}`);
                    const row = new ActionRowBuilder().addComponents(button);
                    
                    return spawn.send({ embeds: [embed], components: [row] }).then(msg => {
                        spawns[spawnId] = {
                            name: country.name,
                            code: country.code,
                            color: color,
                            messageId: msg.id,
                            solved: false
                        };
                        saveSpawns();
                    });
                });
            });
        }
    
        function backup() {
            const data = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf8'));
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
};
