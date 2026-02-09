const {
    EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags 
} = require('discord.js');
const vibrant = require('node-vibrant');

const { neutralize, getSpawn, solve, addToCountrydex } = require('../../functions/import');
const { emojis, images, colors } = require('../../../data/utils.json');

module.exports = {
    async execute(interaction, cllient) {
        if (interaction.customId == 'guess_modal') {
            const answer = interaction.fields.getTextInputValue('guess_input');
            const spawn = await getSpawn(interaction.channel.id);

            if (neutralize(spawn.name) == neutralize(answer) || neutralize(spawn.code) == neutralize(answer)) {
                new vibrant(`https://flagpedia.net/data/flags/w1160/${spawn.code}.jpg`).getPalette()
                    .then(pal => pal.Vibrant?.hex || colors.DEFAULT)
                    .catch(err => {
                        adlog('error', 'node-vibrant', err.stack);
                        return colors.DEFAULT;
                    })
                    .then(async color => {
                        const embed = new EmbedBuilder()
                            .setTitle(`Found by ${interaction.member.user.username}`)
                            .setDescription(`The flag was **${spawn.name}**`)
                            .setImage(`https://flagpedia.net/data/flags/w1160/${spawn.code}.webp`)
                            .setColor(`${color}`)
                        const button = new ButtonBuilder()
                            .setCustomId('disabled_guess_button')
                            .setLabel('Guess')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                            .setEmoji(`${emojis.MAG}`)
                    const row = new ActionRowBuilder().setComponents(button);
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    messages.find(msg => msg.id === spawn.message).edit({embeds: [embed], components: [row]});
                    
                    await solve(interaction.channel.id);

                    await addToCountrydex(interaction.user.id, spawn.code);

                    interaction.deferUpdate();
                })
            } else {
                interaction.reply({ embeds: [new EmbedBuilder()
                    .setColor(colors.ERROR)
                    .setAuthor({
                        iconURL: `${images.ERROR}`,
                        name: 'Failed'
                    })
                    .setDescription(`**${answer}** isn't a correct guess`)
                ], flags: MessageFlags.Ephemeral } );
            }
        }
    }
}