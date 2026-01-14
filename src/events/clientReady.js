const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fs = require('node:fs');
const vibrant = require('node-vibrant');

const { adlog, m, h, spawnTime, backupTime } = require('../functions');

const countries = require('../../data/countries.json');
const { emojis, colors } = require('../../data/utils.json');
const { SPAWN } = require('../../data/config.json');

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

        async function spawnCountry() {
            let data = JSON.parse(await fs.promises.readFile('data/spawns.json', 'utf-8'));
    
            const spawnChannels = client.channels.cache.filter(chnl => chnl.name.toLowerCase().includes(SPAWN));

            for (const spawn of spawnChannels.values()) {
                if (data[spawn.id]?.messageId && !data[spawn.id].solved) {
                    await spawn.messages.fetch(data[spawn.id].messageId)
                        .then(msg => msg.delete())
                        .catch(err => adlog('error', 'json', err));
                }

                const country = countries[Math.floor(Math.random() * countries.length)];
        
                let color = colors.DEFAULT;
                try {
                    const pal = await new vibrant(`https://flagpedia.net/data/flags/w1160/${country.code}.jpg`).getPalette();
                    color = pal.Vibrant?.hex || colors.DEFAULT;
                } catch (err) {
                    adlog('error', 'node-vibrant', err);
                }

                const embed = new EmbedBuilder()
                    .setImage(`https://flagpedia.net/data/flags/w1160/${country.code}.webp`)
                    .setColor(color);
                const button = new ButtonBuilder()
                    .setCustomId('guess_button')
                    .setLabel('Guess')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${emojis.MAG}`);
                const row = new ActionRowBuilder().addComponents(button);

                const msg = await spawn.send({ embeds: [embed], components: [row] });
        
                data[spawn.id] = { 
                    name: country.name, 
                    code: country.code, 
                    color: color, 
                    messageId: msg.id, 
                    solved: false 
                }
            }
            
            await fs.promises.writeFile('data/spawns.json', JSON.stringify(data, null, 4));
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