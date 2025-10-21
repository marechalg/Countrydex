const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
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

        let page = 0;

        if (!dex) return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                iconURL: images.ERROR,
                name: 'Database Error'
            })
            .setDescription('You didn\'t catch any flag')
        ], ephemeral: true })

        let uniq = [...new Map(dex.map(item => [item.code, item])).values()].sort((a, b) => a.name.localeCompare(b.name));
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

        let rows = []

        for (const f of uniq) {
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

            components.push(navigationRow);
        }

        await interaction.reply({ embeds: [embed], components: components });
    }
}