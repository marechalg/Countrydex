const fs = require('node:fs');
const { 
    EmbedBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle, TextInputBuilder, TextInputStyle
} = require('discord.js');
const { pdo, getCountries, LB_TYPES, buildLeaderboardEmbed } = require('../../../functions/import');

module.exports = {
    async execute(interaction, client) {
        const countries = await getCountries();
        let uniq = await pdo.query(fs.readFileSync('data/queries/dex_countries_uniq_sorted.sql', 'utf-8'), [interaction.user.id]);

        // GUESS
        if (interaction.customId == 'guess_button') {
            const modal = new ModalBuilder()
                .setCustomId('guess_modal')
                .setTitle('Guess the Country')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId('guess_input')
                    .setLabel('Guess')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(2)
                    .setMaxLength(32)
                    .setPlaceholder('Name or code (ex: "France" or "fr")')
                    .setRequired(true)
                ))
            await interaction.showModal(modal)
        }

        // DEX PREVIOUS
        if (interaction.customId.startsWith('dex_prev')) {
            let data = interaction.customId.split('_');
            let page = parseInt(data[3]) - 1;

            const pages = Math.ceil(uniq.rowCount / 25);
            uniq = uniq.rows.slice(page * 25, page * 25 + 25);

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

            const pages = Math.ceil(uniq.rowCount / 25);
            uniq = uniq.rows.slice(page * 25, page * 25 + 25);

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

        // LEADERBOARDS
        const isScopeBtn = id => id.startsWith('lb_scope_');
        if (interaction.customId in LB_TYPES || isScopeBtn(interaction.customId)) {
            await interaction.deferUpdate();

            try {
                const buttons = interaction.message.components.flatMap(r => r.components);

                const switchTarget = buttons.find(b => isScopeBtn(b.customId)).customId.replace('lb_scope_', '');
                const currentScope = switchTarget === 'global' ? 'local' : 'global';

                const type = interaction.customId in LB_TYPES
                    ? interaction.customId
                    : buttons.find(b => b.disabled && b.customId in LB_TYPES)?.customId ?? 'lb_completion';
                const scope = isScopeBtn(interaction.customId) ? switchTarget : currentScope;

                const embed = await buildLeaderboardEmbed(client, interaction.guild, type, scope);

                const nextScope = scope === 'global' ? 'local' : 'global';
                const components = interaction.message.components.map(row =>
                    new ActionRowBuilder().addComponents(row.components.map(b => {
                        const btn = ButtonBuilder.from(b);
                        if (isScopeBtn(b.customId)) {
                            return btn.setCustomId(`lb_scope_${nextScope}`).setLabel(`Switch to ${nextScope}`);
                        }
                        const active = b.customId === type;
                        return btn.setDisabled(active).setStyle(active ? ButtonStyle.Secondary : ButtonStyle.Primary);
                    }))
                );

                await interaction.editReply({ embeds: [embed], components });
            } catch (e) {
                console.error(e);
            }
        }
    }
}