const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const fs = require('node:fs');

const { pdo } = require('../functions/import');

const { images } = require('../../data/utils.json');

const countries = require('../../data/countries.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dex')
        .setDescription('Display the content of your Countrydex'),
    async execute(interaction) {
        const dex = await pdo.query(fs.readFileSync('data/queries/dex_countries.sql', 'utf-8'), [interaction.user.id]);

        let page = 0;

        if (dex.rowCount == 0) return interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: images.DEX,
            })
            .addFields({
                name: 'Collection',
                value: `**0**/${countries.length} (0%)`
            })
            .setDescription('You didn\'t catch any flag')
        ] })

        let uniq = [...new Map(dex.rows.map(item => [item.code, item])).values()].sort((a, b) => a.name.localeCompare(b.name));
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: `${images.DEX}`,
            })
            .addFields({
                name: 'Collection',
                value: `**${uniq.length}**/${countries.length} (${((uniq.length / countries.length ) * 100).toFixed(0)}%)`
            })
        ;

        let components = []

        const pages = Math.ceil(uniq.length / 25);

        let rows = []

        for (const f of uniq.slice(0, 25)) {
            rows.push(new StringSelectMenuOptionBuilder()
                .setLabel(`[${f.code}] ${f.name}`)
                .setValue(`${f.code}`)
            )
        }

        const selectionMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId(`dex_${interaction.user.id}_${page}`)
            .setPlaceholder('List of collected flags')
            .addOptions(rows)
        )

        components.push(selectionMenu);
        
        if (pages > 1) {
            uniq = uniq.slice(0, 25);
            embed.setFooter({ text: `Page 1/${pages}` });

            const navigationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`dex_prev_${interaction.user.id}_${page}`)
                    .setLabel('◀ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`dex_next_${interaction.user.id}_${page}`)
                    .setLabel('Next ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false)
            )

            components.push(navigationRow);
        }

        await interaction.reply({ embeds: [embed], components: components });
    }
}