const { SlashCommandBuilder, SlashCommandChannelOption, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { images } = require('../../data/utils.json');
const { setSpawn } = require('../functions/import');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setspawn')
        .setDescription('Set server flags spawning channel')
        .addChannelOption(new SlashCommandChannelOption()
            .setName('channel')
            .setDescription('The future country spawning channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');

        await setSpawn(interaction.guildId, channel.id);

        interaction.reply({ embeds: [new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: `Successfully updated ${interaction.guild.name} flag spawning channel to ${channel.name}`,
                iconURL: `${images.SUCCESS}`
            })
        ], flags: MessageFlags.Ephemeral})
    }
}