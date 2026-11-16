const {
    EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags
} = require('discord.js');
const vibrant = require('node-vibrant');

const { adlog, neutralize, getSpawn, solve, addToCountrydex } = require('../../functions/import');
const { emojis, images, colors } = require('../../../data/utils.json');

module.exports = {
    async execute(interaction, client) {
        if (interaction.customId !== 'guess_modal') return;

        const answer = interaction.fields.getTextInputValue('guess_input');
        const spawn = await getSpawn(interaction.channel.id);
        const guess = neutralize(answer);

        const correct = [spawn.name_en, spawn.name_fr, spawn.code]
            .some(v => neutralize(v) === guess);

        if (!correct) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(colors.ERROR)
                    .setAuthor({ iconURL: `${images.ERROR}`, name: 'Failed' })
                    .setDescription(`**${answer}** isn't a correct guess`)
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferUpdate();

        const flagUrl = `https://flagpedia.net/data/flags/w1160/${spawn.code}`;

        let color = colors.DEFAULT;
        try {
            const pal = await new vibrant(`${flagUrl}.jpg`).getPalette();
            color = pal.Vibrant?.hex || colors.DEFAULT;
        } catch (err) {
            adlog('error', 'node-vibrant', err.stack);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Found by ${interaction.member.user.username}`)
            .setDescription(`The flag was **${spawn.name_en}**`)
            .setImage(`${flagUrl}.webp`)
            .setColor(color);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('disabled_guess_button')
                .setLabel('Guess')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                .setEmoji(`${emojis.MAG}`)
        )

        try {
            const msg = await interaction.channel.messages.fetch(spawn.message);
            await msg.edit({ embeds: [embed], components: [row], attachments: [] });
        } catch (err) {
            adlog('error', 'guess_modal', err.stack);
        }

        await solve(interaction.channel.id);
        await addToCountrydex(interaction.user.id, spawn.code);
    }
}