const fs = require('node:fs');
const { 
    EmbedBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle, TextInputBuilder, TextInputStyle
} = require('discord.js');

const { pdo, getCountries } = require('../../../functions/import');

const { images } = require('../../../../data/utils.json');

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

        // COMPLETIONNIST LEADERBOARD 
        if (interaction.customId == 'lb_completion') {
            const leaderboard = await pdo.query(fs.readFileSync('data/queries/leaderboard_unique.sql', 'utf-8'));

            let embed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    iconURL: `${images.PODIUM}`,
                    name: 'Leaderboard'
                })
                .setFooter({
                    text: 'Completion Leaderboard'
                });
        
            let i = 1;
            for (const userInfos of leaderboard.rows) {
                let place;
                switch (i) {
                    case 1:
                        place = '🏆';
                        break;
                    case 2:
                        place = '🥈';
                        break;
                    case 3:
                        place = '🥉';
                        break;
                    default:
                        place = '#' + i;
                        break;
                }

                const user = await client.users.fetch(userInfos.owner);
                embed.addFields({
                    name: `${place} ${user.username}`,
                    value: `**${Math.floor(userInfos.count * 100 / countries.rowCount)}**% *(${userInfos.count}/${countries.rowCount})*`
                })

                i++;
            }

            const row = new ActionRowBuilder();
            for (const button of interaction.message.components[0].components) {
                const btn = ButtonBuilder.from(button);
                if (button.customId === 'lb_completion') {
                    btn.setDisabled(true);
                    btn.setStyle(ButtonStyle.Secondary);
                } else {
                    btn.setDisabled(false);
                    btn.setStyle(ButtonStyle.Primary);
                }
                row.addComponents(btn);
            }

            await interaction.update({
                embeds: [embed],
                components: [row]
            });
        }

        // COLLECTOR LEADERBOAD
        if (interaction.customId == 'lb_collection') {
            const leaderboard = await pdo.query(fs.readFileSync('data/queries/leaderboard_all.sql', 'utf-8'));

            let embed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    iconURL: `${images.PODIUM}`,
                    name: 'Leaderboard'
                })
                .setFooter({
                    text: 'Collector Leaderboard'
                });
        
            let i = 1;
            for (const userInfos of leaderboard.rows) {
                let place;
                switch (i) {
                    case 1:
                        place = '🏆';
                        break;
                    case 2:
                        place = '🥈';
                        break;
                    case 3:
                        place = '🥉';
                        break;
                    default:
                        place = '#' + i;
                        break;
                }

                const user = await client.users.fetch(userInfos.owner);
                embed.addFields({
                    name: `${place} ${user.username}`,
                    value: `**${userInfos.count}** flags caught`
                })

                i++;
            }

            const row = new ActionRowBuilder();
            for (const button of interaction.message.components[0].components) {
                const btn = ButtonBuilder.from(button);
                if (button.customId === 'lb_collection') {
                    btn.setDisabled(true);
                    btn.setStyle(ButtonStyle.Secondary);
                } else {
                    btn.setDisabled(false);
                    btn.setStyle(ButtonStyle.Primary);
                }
                row.addComponents(btn);
            }

            await interaction.update({
                embeds: [embed],
                components: [row]
            });
        }

        // SPEED LEADERBOAD
        if (interaction.customId == 'lb_quick_draw') {
            const leaderboard = await pdo.query(fs.readFileSync('data/queries/leaderboard_quick.sql', 'utf-8'));

            let embed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    iconURL: `${images.PODIUM}`,
                    name: 'Leaderboard'
                })
                .setFooter({
                    text: 'Speed Leaderboard'
                });
        
            let i = 1;
            for (const userInfos of leaderboard.rows) {
                let place;
                switch (i) {
                    case 1:
                        place = '🏆';
                        break;
                    case 2:
                        place = '🥈';
                        break;
                    case 3:
                        place = '🥉';
                        break;
                    default:
                        place = '#' + i;
                        break;
                }

                const user = await client.users.fetch(userInfos.owner);
                embed.addFields({
                    name: `${place} ${user.username}`,
                    value: `**${Math.floor(userInfos.avg)}** min`
                })

                i++;
            }

            const row = new ActionRowBuilder();
            for (const button of interaction.message.components[0].components) {
                const btn = ButtonBuilder.from(button);
                if (button.customId === 'lb_quick_draw') {
                    btn.setDisabled(true);
                    btn.setStyle(ButtonStyle.Secondary);
                } else {
                    btn.setDisabled(false);
                    btn.setStyle(ButtonStyle.Primary);
                }
                row.addComponents(btn);
            }

            await interaction.update({
                embeds: [embed],
                components: [row]
            });
        }
    }
}