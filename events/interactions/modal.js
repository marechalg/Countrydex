const fs = require('node:fs');
const moment = require('moment');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const { neutralize } = require('../../functions');
const { emojis } = require('../../../data/utils.json');

module.exports = {
    async execute(interaction, cllient) {
        if (interaction.customId == 'guess_modal') {
            const answer = interaction.fields.getTextInputValue('guess_input');
            const spawns = JSON.parse(fs.readFileSync('data/spawns.json'));

            if (neutralize(spawns[interaction.channel.id].name) == neutralize(answer) || neutralize(spawns[interaction.channel.id].code) == neutralize(answer)) {
                const embed = new EmbedBuilder()
                    .setTitle(`Found by ${interaction.member.user.username}`)
                    .setDescription(`The flag was **${spawns[interaction.channel.id].name}**`)
                    .setImage(`https://flagpedia.net/data/flags/w1160/${spawns[interaction.channel.id].code}.webp`)
                    .setColor(`${spawns[interaction.channel.id].color}`)
                const button = new ButtonBuilder()
                    .setCustomId('disabled_guess_button')
                    .setLabel('Guess')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji(`${emojis.MAG}`)
                const row = new ActionRowBuilder().setComponents(button);
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                messages.find(msg => msg.id === spawns[interaction.channel.id].messageId).edit({embeds: [embed], components: [row]});

                spawns[interaction.channel.id].solved = true;
                fs.writeFileSync('data/spawns.json', JSON.stringify(spawns, null, 4));

                let dexs = JSON.parse(fs.readFileSync('data/countrydexs.json'));

                let country = {
                    "name": spawns[interaction.channel.id].name,
                    "code": spawns[interaction.channel.id].code,
                    "color": spawns[interaction.channel.id].color,
                    "date": moment.now()
                }
                    
                if (dexs.hasOwnProperty(interaction.member.user.id)) {
                    dexs[interaction.member.user.id].push(country);
                } else {
                    dexs[interaction.member.user.id] = [country];
                }
                fs.writeFileSync('data/countrydexs.json', JSON.stringify(dexs, null, 2));
            }
        }
    }
}