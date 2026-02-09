const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const fs = require('node:fs');

const { pdo, adlog } = require('../functions/import');

const { colors, images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset your Countrydex progression (⚠️ IRREVERSIBLE)'),
    async execute(interaction, client) {
        try {
            await pdo.query(fs.readFileSync('data/queries/reset.sql', 'utf-8'), [interaction.user.id]);

            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor(colors.SUCCESS)
                .setAuthor({
                    name: 'Successfully reset your Countrydex progression',
                    iconURL: images.SUCCESS
                })
            ], flags: MessageFlags.Ephemeral })
        } catch (err) {
            adlog('error', 'pgsql', err.stack);
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor(colors.ERROR)
                .setAuthor({
                    name: 'Error',
                    iconURL: images.ERROR
                })
                .addFields([
                    {
                        name: 'Database Error',
                        value: 'Unexpected error during database deletion'
                    }, {
                        name: 'Error Sample',
                        value: err.message
                    }
                ])
            ], flags: MessageFlags.Ephemeral })
        }
    }
}