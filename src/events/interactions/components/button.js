const fs = require('node:fs');
const { 
    EmbedBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle, TextInputBuilder, TextInputStyle
} = require('discord.js');
const moment = require('moment');

const { images } = require('../../../../data/utils.json');
const countries = require ('../../../../data/countries.json');

module.exports = {
    async execute(interaction, client) {
        const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
        const dex = dexs[interaction.user.id];

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

        // COMPLETIONNIST LEADERBOARD 
        if (interaction.customId == 'lb_completion') {
            let leaderboard = [];
            let ct = 0;
            for (const [userId, flags] of Object.entries(dexs)) {
                if (ct++ >= 10) break;
                let uniq = [...new Map(flags.map(item => [item.code, item])).values()].sort((a, b) => a.name.localeCompare(b.name));
                leaderboard.push({'id': userId, 'amount': uniq.length, 'pourcentage': uniq.length * 100 / countries.length});
            }

            leaderboard.sort((a, b) => b.pourcentage - a.pourcentage);

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
            for (const userInfos of leaderboard) {
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

                embed.addFields({
                    name: `${place} ${client.users.cache.find(user => user.id == userInfos.id).username}`,
                    value: `**${Math.floor(userInfos.pourcentage)}**% *(${userInfos.amount}/${countries.length})*`
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
            let leaderboard = [];
            let ct = 0;
            for (const [userId, flags] of Object.entries(dexs)) {
                if (ct++ >= 10) break;
                leaderboard.push({'id': userId, 'amount': flags.length});
            }

            leaderboard.sort((a, b) => b.amount - a.amount);

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
            for (const userInfos of leaderboard) {
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

                embed.addFields({
                    name: `${place} ${client.users.cache.find(user => user.id == userInfos.id).username}`,
                    value: `**${userInfos.amount}** flags caught`
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
            let leaderboard = [];
            let ct = 0;
            for (const [userId, flags] of Object.entries(dexs)) {
                if (ct++ >= 10) break;
                let avg = 0;
                for (const flag of flags) {
                    const min = moment(flag.date).minutes();
                    avg += min < 30 ? min : min - 30;
                }
                avg /= flags.length;
                leaderboard.push({'id': userId, 'amount': flags.length, 'time': avg});
            }

            leaderboard.sort((a, b) => a.time - b.time);

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
            for (const userInfos of leaderboard) {
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

                embed.addFields({
                    name: `${place} ${client.users.cache.find(user => user.id == userInfos.id).username}`,
                    value: `**${Math.floor(userInfos.time)}** min`
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