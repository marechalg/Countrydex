const { EmbedBuilder } = require('discord.js');

const { adlog } = require('../../../functions');
const { images } = require('../../../../data/utils.json');

module.exports = {
    async execute(interaction, client) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                iconURL: `${images.ERROR}`,
                name: 'Error'
            })
            .addFields({
                name: 'Command Error',
                value: 'This command doesn\'t exist'
            })
        ] });
        
        try {
            await command.execute(interaction, client);
        } catch (err) {
            adlog('error', 'discord', `${err}`);
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    iconURL: `${images.ERROR}`,
                    name: 'Error'
                })
                .addFields([
                    {
                        name: 'Unexpected Error',
                        value: 'This error is not expected',
                        inline: false
                    }, {
                        name: 'Error Sample',
                        value: `${err}`
                    }
                ])
                .setFooter({
                    text: 'If you think that it\'s something else, please contact a developer'
                })
            ]})
        }
    }
}