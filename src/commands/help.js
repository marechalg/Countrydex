const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Descriptive list of the commands'),
    async execute(interaction, client) {
        const help = new EmbedBuilder()
            .setAuthor({
                name: 'List of Commands',
                iconURL: `${images.HELP}`
            })
            .setColor('Blurple')
        client.commands.forEach(cmd => {
            if (cmd.data.name == 'help') return;
            help.addFields({
                name: `${cmd.data.name}`,
                value: `${cmd.data.description}`
            })
        })
        try {
            await interaction.user.send({ embeds: [help] });
            interaction.reply('sent');
        } catch {
            interaction.reply({ embeds: [help] });
        }
    }
}