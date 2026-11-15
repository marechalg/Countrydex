const {
    SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandStringOption, PermissionFlagsBits
} = require('discord.js');

const { buildLeaderboardEmbed } = require('../functions/import');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Leaderboard of flags collection')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(new SlashCommandStringOption()
            .setName('scope')
            .setDescription('Choose if the leaderboard is local or global')
            .addChoices([
                { name: 'local', value: 'local' }, { name: 'global', value: 'global' }
            ])
        ),
    async execute(interaction, client) {
        await interaction.deferReply();

        const scope = interaction.options.getString('scope') ?? 'global';
        const next = scope === 'global' ? 'local' : 'global';

            const embed = await buildLeaderboardEmbed(client, interaction.guild, 'lb_completion', scope);

            const bar = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('lb_completion')
                    .setLabel('Completionnist')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('lb_collection')
                    .setLabel('Collector')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lb_quick_draw')
                    .setLabel('Speed')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`lb_scope_${next}`)
                    .setLabel(`Switch to ${next}`)
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [embed], components: [bar] });
    }
}