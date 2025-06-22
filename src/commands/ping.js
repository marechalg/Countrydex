const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const moment = require('moment');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Display latency and uptime of the client'),
    async execute(interaction, client) {
        interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({
                name: 'Client status',
                iconURL: `${images.CONNECTION}`
            })
            .setColor('Blurple')
            .addFields([
                {
                    name: 'Ping',
                    value: `**${client.ws.ping}** ms`,
                    inline: true
                }, {
                    name: 'Uptime',
                    value: `**${(client.uptime / (1000 * 60 * 60)).toFixed(1)}** h`,
                    inline: true
                }
            ])
        ]})
    }
}