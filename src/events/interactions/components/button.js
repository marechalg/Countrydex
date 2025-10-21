const fs = require('node:fs');
const { 
    EmbedBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle, TextInputBuilder, TextInputStyle
} = require('discord.js');

module.exports = {
    async execute(interaction, client) {
        // GUESS
        if (interaction.customId == 'guess_button') {
                const modal = new ModalBuilder()
                    .setCustomId('guess_modal')
                    .setTitle('Guess the Country')
                    .addComponents([new ActionRowBuilder().addComponents(new TextInputBuilder()
                        .setCustomId('guess_input')
                        .setLabel('Guess')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(2)
                        .setMaxLength(32)
                        .setPlaceholder('Name or code (ex: "France" or "fr")')
                        .setRequired(true)
                    )])
                await interaction.showModal(modal)
            }

            // DEX PREVIOUS
            if (interaction.customId.startsWith('dex_prev')) {
                let data = interaction.customId.split('_');
                let page = parseInt(data[3]) - 1;

                const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
                const dex = dexs[interaction.user.id];

                let uniq = [...new Map(dex.map(item => [item.code, item])).values()].sort((a, b) => a.name.localeCompare(b.name));
                const pages = Math.ceil(uniq.length / 25);
                uniq = uniq.slice(page * 25, page * 25 + 25);

                const navigationRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`dex_prev_${interaction.user.id}_${page}`)
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page == 0),
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

                let embed = EmbedBuilder.from(interaction.message.embeds[0]);
                embed.setFooter({ text: `Page ${page + 1}/${pages}` });

                await interaction.update({ embeds: [embed], components: [selectionMenu, navigationRow]});
            }

            // DEX NEXT
            if (interaction.customId.startsWith('dex_next')) {
                let data = interaction.customId.split('_');
                let page = parseInt(data[3]) + 1;

                const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
                const dex = dexs[interaction.user.id];

                let uniq = [...new Map(dex.map(item => [item.code, item])).values()].sort((a, b) => a.name.localeCompare(b.name));
                const pages = Math.ceil(uniq.length / 25);
                uniq = uniq.slice(page * 25, page * 25 + 25);

                const navigationRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`dex_prev_${interaction.user.id}_${page}`)
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId(`dex_next_${interaction.user.id}_${page}`)
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= pages - 1)
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

                let embed = EmbedBuilder.from(interaction.message.embeds[0]);
                embed.setFooter({ text: `Page ${page + 1}/${pages}` });

                await interaction.update({ embeds: [embed], components: [selectionMenu, navigationRow]});
            }
    }
}