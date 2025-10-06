const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('node:fs');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dex')
        .setDescription('Display the content of your Countrydex'),
    async execute(interaction) {
        const countries = JSON.parse(fs.readFileSync('data/countries.json', 'utf-8'));
        const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
        const dex = dexs[interaction.user.id];
        const uniq = [...new Map(dex.map(item => [item.code, item])).values()];

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: `${images.DEX}`,
            })
            .addFields({
                name: 'Collection',
                value: `**${uniq.length}**/${countries.length} (${((uniq.length / countries.length ) * 100).toFixed(0)}%)`
            })
        
        let rows = []
        for (const f of uniq) {
            rows.push(new StringSelectMenuOptionBuilder()
                .setLabel(`[${f.code}] ${f.name}`)
                .setValue(`${f.code}`));
        }

        const selectionMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('dexList')
            .setPlaceholder('List of collected flags')
            .addOptions(rows)
        )

        await interaction.reply({ embeds: [embed], components: [selectionMenu] });
    }
}