const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

const { images } = require('../../../../data/utils.json');

module.exports = {
    async execute(interaction, client) {
        await interaction.deferUpdate();
        
        const selected = interaction.values[0];
        const user = interaction.customId.split('_')[1] || interaction.user.id;
        const dex = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'))[user];
    
        if (!dex) {
            return interaction.followUp({ content: 'Dex data not found.', ephemeral: true });
        }
    
        const flags = dex.filter(flag => flag.code === selected);
    
        if (flags.length === 0) {
            return interaction.followUp({ content: 'This flag was not found in this dex.', ephemeral: true });
        }
    
        const FLAG = flags[0];
        const count = flags.length;
        const dates = flags.map(f => f.date).sort((a, b) => a - b);
        const firstCaught = dates[0];
        const lastCaught = dates[dates.length - 1];

        let lb = [];
        const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
        for (const [usr, dex] of Object.entries(dexs)) {
            const flags = dex.filter(flag => flag.code === selected);
            let c = flags.length;
            let firstDate = flags.length > 0 ? Math.min(...flags.map(f => f.date)) : Infinity;
            lb.push({id: usr, count: c, firstCaught: firstDate});
        }
        lb.sort((a, b) => b.count - a.count || a.firstCaught - b.firstCaught);

        const rank = lb.findIndex(entry => entry.id === user) + 1;

        interaction.message.edit({ embeds: [new EmbedBuilder()
            .setAuthor({
                iconURL: `${images.GLOBE}`,
                name: `[${FLAG.code}] ${FLAG.name}`
            })
            .addFields([
                {
                    name: 'First time caught',
                    value: `<t:${Math.floor(firstCaught / 1000)}:R>`,
                    inline: true
                }, {
                    name: 'Last time caught',
                    value: `<t:${Math.floor(lastCaught / 1000)}:R>`,
                    inline: true
                }, { name: '\u200b', value: '\u200b', inline: true }, 
                {
                    name: 'Count',
                    value: `**${count}**`,
                    inline: true
                }, {
                    name: 'Flag rank',
                    value: `#**${rank}**`,
                    inline: true
                }, { name: '\u200b', value: '\u200b', inline: true }
            ])
            .setColor(`${FLAG.color}`)
            .setImage(`https://flagpedia.net/data/flags/w1160/${selected}.jpg`)
        ], components: interaction.message.components })
    }
}