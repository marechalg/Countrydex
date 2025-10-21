const { SlashCommandBuilder, EmbedBuilder, SlashCommandStringOption, MessageFlags, PermissionFlagsBits } = require('discord.js');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a N number of messages')
        .addStringOption(new SlashCommandStringOption()
            .setName('number')
            .setDescription('Number of messages to delete')
            .setRequired(true)
        ),
    async execute(interaction, client) {
        const num = interaction.options.getString('number');
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({
                name: 'Error',
                iconURL: `${images.ERROR}`
            })
            .addFields({
                name: 'Permission Error',
                value: 'Missing `MANAGE_MESSAGES` permission'
            })
            .setColor('Red')
        ], flags: MessageFlags.Ephemeral })

        if (isNaN(num) || num < 1 || num > 99) return interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({
                name: 'Error',
                iconURL: `${images.ERROR}`
            })
            .addFields({
                name: 'Parameter Error',
                value: 'The number of messages must be an integer between 1 and 99'
            })
            .setColor('Red')
        ], flags: MessageFlags.Ephemeral }) 

        try {
            await interaction.channel.bulkDelete(num);
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor('Green')
                .setAuthor({
                    name: `Successfully deleted ${num} messages`,
                    iconURL: `${images.SUCCESS}`
                })
            ], flags: MessageFlags.Ephemeral})
        } catch (err) {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: 'Error',
                    iconURL: `${images.ERROR}`
                })
                .addFields([
                    {
                        name: 'Unexpected Error',
                        value: 'This could be because some messages are older then 2 weeks',
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