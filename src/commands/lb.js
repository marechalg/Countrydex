const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle
} = require('discord.js');
const fs = require('node:fs');

const { pdo } = require('../functions/import');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Leaderboard of flags collection'),
    async execute(interaction, client) {
        const countries = await pdo.query(fs.readFileSync('data/queries/countries.sql', 'utf-8'));

        const leaderboard = await pdo.query(fs.readFileSync('data/queries/leaderboard_unique.sql', 'utf-8'));

        let embed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                iconURL: `${images.PODIUM}`,
                name: 'Leaderboard'
            })
            .setFooter({
                text: 'Completion Leaderboard'
            })
        ;
        
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

            console.log(userInfos);
            const user = await client.users.fetch(userInfos.owner);
            embed.addFields({
                name: `${place} ${user.username}`,
                value: `**${Math.floor(userInfos.count * 100 / countries.rowCount)}**% *(${userInfos.count}/${countries.rowCount})*`
            })

            i++;
        }

        const bar = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('lb_completion')
                .setLabel('Completionnist')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('lb_collection')
                .setLabel('Collector')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId('lb_quick_draw')
                .setLabel('Speed')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)
        )

        interaction.reply({ embeds: [embed], components: [bar] });
    }
}