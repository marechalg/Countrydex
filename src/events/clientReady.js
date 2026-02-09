const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType, PermissionFlagsBits } = require('discord.js');
const vibrant = require('node-vibrant');

const {
    adlog, m, h, spawnTime, backupTime, getCountries, getSpawn, newSpawn, backup
} = require('../functions/import');

const { emojis, colors } = require('../../data/utils.json');
const { SPAWN } = require('../../data/config.json');

module.exports = {
    name: 'clientReady',
    once: true,
    
    async execute(client) {
        adlog('log', 'discord', `Connected to ${client.user.tag}`);
        
        const countries = await getCountries();
        
        setInterval(() => {
            const remainingTime = Math.round(spawnTime() / m(1));
            client.user.setPresence({
                activities: [{ name: `${remainingTime} min`, type: ActivityType.Custom, state: `Spawning in ${remainingTime} min` }]
            });
        }, m(1));
        
        function spawnCountry() {
            client.channels.cache.filter(chnl => chnl.name.toLowerCase().includes(SPAWN)).forEach(async spawnChnl => {
                const spawnId = spawnChnl.id;
                const spawn = await getSpawn(spawnId);
                
                if (spawn != null && !spawn.solved) {
                    try {
                        await spawnChnl.messages.fetch(spawn.message).then(msg => {
                            try {
                                msg.delete();
                            } catch {}
                        })
                    } catch {}
                }

                console.log(countries.rowCount);
                
                const country = countries.rows[Math.floor(Math.random() * countries.rowCount)];
                
                new vibrant(`https://flagpedia.net/data/flags/w1160/${country.code}.jpg`).getPalette()
                    .then(pal => pal.Vibrant?.hex || colors.DEFAULT)
                    .catch(err => {
                        adlog('error', 'node-vibrant', err.stack);
                        return colors.DEFAULT;
                    })
                    .then(async color => {
                        const embed = new EmbedBuilder()
                            .setImage(`https://flagpedia.net/data/flags/w1160/${country.code}.webp`)
                            .setColor(color);
                        const button = new ButtonBuilder()
                            .setCustomId('guess_button')
                            .setLabel('Guess')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(`${emojis.MAG}`);
                        const row = new ActionRowBuilder().addComponents(button);
                        
                        const clientAsMember = await spawnChnl.guild.members.fetchMe();
                        if (clientAsMember.permissions.has(PermissionFlagsBits.SendMessages)) {
                            return spawnChnl.send({ embeds: [embed], components: [row] }).then(msg => {
                                newSpawn(spawnChnl.id, msg.id, country.code);
                            })
                        }
                    })
                ;
            })
        }
    
        setTimeout(() => {
            spawnCountry();
            setInterval(spawnCountry, h(1));
        }, m(1));
    
        setTimeout(() => {
            backup();
            setInterval(backup, h(24));
        }, backupTime());
    }
}
