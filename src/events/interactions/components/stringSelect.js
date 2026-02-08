const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');
const vibrant = require('node-vibrant');

const { pdo, getFirstCaught, getLastCaught, getCaught } = require('../../../functions/import');

const { images, colors } = require('../../../../data/utils.json');

module.exports = {
    async execute(interaction, client) {
        await interaction.deferUpdate();
        
        const selected = interaction.values[0];
        const user = interaction.customId.split('_')[1] || interaction.user.id;

        const dex = await pdo.query(fs.readFileSync('data/queries/dex_countries.sql', 'utf-8'), [user]);
    
        if (!dex.rows) return interaction.followUp({ content: 'Dex data not found.', ephemeral: true });
    
        if (!dex.rows.find(flag => flag.code === selected)) {
            return interaction.followUp({ content: 'This flag is no longer in this dex.', ephemeral: true });
        }

        const lb = await pdo.query(fs.readFileSync('data/queries/flag_leaderboard.sql', 'utf-8'), [selected]);
        const rank = lb.rows.findIndex(entry => entry.owner === user) + 1;

        const country = await getCaught(interaction.user.id, selected);

        const firstCaught = await getFirstCaught(interaction.user.id, selected);
        const lastCaught = await getLastCaught(interaction.user.id, selected);

        new vibrant(`https://flagpedia.net/data/flags/w1160/${selected}.jpg`).getPalette()
            .then(pal => pal.Vibrant?.hex || colors.DEFAULT)
            .catch(err => {
                adlog('error', 'node-vibrant', err.stack);
                return colors.DEFAULT;
            })
            .then(color => {
                interaction.message.edit({ embeds: [new EmbedBuilder()
                    .setAuthor({
                        iconURL: `${images.GLOBE}`,
                        name: `[${selected}] ${country.rows[0].name}`
                    })
                    .setDescription(`${country.rows[0].description}`)
                    .addFields([
                        {
                            name: 'First time caught',
                            value: `<t:${Math.floor(parseInt(firstCaught.timestamp) / 1000)}:R>`,
                            inline: true
                        }, {
                            name: 'Last time caught',
                            value: `<t:${Math.floor(parseInt(lastCaught.timestamp) / 1000)}:R>`,
                            inline: true
                        }, { name: '\u200b', value: '\u200b', inline: true }, 
                        {
                            name: 'Count',
                            value: `**${country.rowCount}**`,
                            inline: true
                        }, {
                            name: 'Flag rank',
                            value: `#**${rank}**`,
                            inline: true
                        }, { name: '\u200b', value: '\u200b', inline: true }
                    ])
                    .setColor(`${color}`)
                    .setImage(`https://flagpedia.net/data/flags/w1160/${selected}.jpg`)
                ], components: interaction.message.components })
            })
    }
}