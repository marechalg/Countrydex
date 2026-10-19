const { SlashCommandBuilder, EmbedBuilder, SlashCommandStringOption, MessageFlags, PermissionFlagsBits } = require('discord.js');

const { images } = require('../../data/utils.json');
const { setUserLanguage } = require('../functions/import');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Change your prefered language')
        .addStringOption(new SlashCommandStringOption()
            .setName('lang')
            .setDescription('Your prefered language')
            .addChoices([
                { name: 'Français', value: 'fr' }, { name: 'English', value: 'en' }
            ])
            .setRequired(true)
        ),
    async execute(interaction, client) {
        const lang = interaction.options.getString('lang');

        try {
            await setUserLanguage(interaction.user.id, lang);

            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor('Green')
                .setAuthor({
                    name: `Successfully changed your prefered language to ${lang}`,
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
                        value: 'Failes to change your prefered language',
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