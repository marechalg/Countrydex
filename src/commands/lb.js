const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');

const { images } = require('../../data/utils.json');
const countries = require ('../../data/countries.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Leaderboard of flags collection'),
    async execute(interaction, client) {
        const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));

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
            })
        ;
        
        let i = 1;
        for (const userInfos  of leaderboard) {
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

        interaction.reply({ embeds: [embed] });
    }
}