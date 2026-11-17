const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../functions/import');
const { colors, images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Bot statistics summary'),
    async execute(interaction, client) {
        const stats = await getStats();

        interaction.reply({ embeds: [new EmbedBuilder()
            .setColor(colors.DEFAULT)
            .setAuthor({
                name: 'Countrydex\'s Statistics',
                iconURL: images.STATS
            })
            .addFields([
                {
                    name: 'Servers',
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: 'Users',
                    value: String(stats.rows[0].users),
                    inline: true
                },
                {
                    name: 'Total Catchs',
                    value: String(stats.rows[0].total_catchs),
                    inline: false
                },
                {
                    name: 'Average Completion',
                    value: `${Math.round(stats.rows[0].average_completion)}%`,
                    inline: true
                },
                {
                    name: 'Most Catched Flag',
                    value: `${stats.rows[0].most_catched_flag} : ${stats.rows[0].most_catched_number}`,
                    inline: false
                }
            ])
        ] })
    }
}