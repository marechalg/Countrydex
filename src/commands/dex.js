const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const fs = require('node:fs');

const { pdo, getCountries, getUserLanguage } = require('../functions/import');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dex')
        .setDescription('Display the content of your Countrydex'),
    async execute(interaction) {
        const countries = await getCountries();
        const dex = await pdo.query(fs.readFileSync('data/queries/dex_countries.sql', 'utf-8'), [interaction.user.id]);

        let page = 0;

        if (dex.rowCount == 0) return interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: images.DEX,
            })
            .addFields({
                name: 'Collection',
                value: `**0**/${countries.rowCount} (0%)`
            })
            .setDescription('You didn\'t catch any flag')
        ] })

        let uniq = await pdo.query(fs.readFileSync('data/queries/dex_countries_uniq_sorted.sql', 'utf-8'), [interaction.user.id]);

        const lang = getUserLanguage(interaction.user.id);

        uniq.rows.sort((a, b) => {
            const nameA = lang === 'fr' ? a.name_fr : a.name_en;
            const nameB = lang === 'fr' ? b.name_fr : b.name_en;
            return nameA.localeCompare(nameB);
        });

        const itemsPerPage = 25;
        const pages = Math.ceil(uniq.rows.length / itemsPerPage);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: images.DEX,
            })
            .addFields({
                name: 'Collection',
                value: `**${dex.rowCount}**/${countries.rowCount} (${Math.round((dex.rowCount / countries.rowCount) * 100)}%)`
            });

        let rows = [];
        for (const f of uniq.rows.slice(0, itemsPerPage)) {
            rows.push(new StringSelectMenuOptionBuilder()
                .setLabel(`[${f.code}] ${lang === 'fr' ? f.name_fr : f.name_en}`)
                .setValue(`${f.code}`)
            )
        }

        const selectionMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId(`dex_${interaction.user.id}_${page}`)
            .setPlaceholder('List of collected flags')
            .addOptions(rows)
        )
        
        const components = [selectionMenu];

        if (pages > 1) {
            embed.setFooter({ text: `Page ${page + 1}/${pages}` });

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