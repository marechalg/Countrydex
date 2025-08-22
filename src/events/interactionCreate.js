const { emojis, images } = require('../../data/utils.json');

const {
    ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ButtonStyle, EmbedBuilder, ButtonBuilder,
    Utils
} = require('discord.js');
const fs = require('node:fs');

const { neutralize } = require('../functions');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute (interaction, client) {
        if (interaction.isButton()) {
            if (interaction.customId == 'guess_button') {
                const modal = new ModalBuilder()
                    .setCustomId('guess_modal')
                    .setTitle('Guess the Country')
                    .addComponents([new ActionRowBuilder().addComponents(new TextInputBuilder()
                        .setCustomId('guess_input')
                        .setLabel('Guess')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(2)
                        .setMaxLength(32)
                        .setPlaceholder('Name or code (ex: "France" or "fr")')
                        .setRequired(true)
                    )])
                await interaction.showModal(modal)
            }
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            if (interaction.customId == 'guess_modal') {
                const answer = interaction.fields.getTextInputValue('guess_input');
                const data = JSON.parse(fs.readFileSync('data/spawns.json'));
                if (neutralize(data[interaction.channel.id].name.toLowerCase()) == neutralize(answer.toLowerCase()) || neutralize(data[interaction.channel.id].code.toLowerCase()) == neutralize(answer.toLowerCase())) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Found by ${interaction.member.user.username}`)
                        .setDescription(`The flag was **${data[interaction.channel.id].name}**`)
                        .setImage(`https://flagpedia.net/data/flags/w1160/${data[interaction.channel.id].code}.webp`)
                        .setColor(`${data[interaction.channel.id].color}`)
                    const button = new ButtonBuilder()
                        .setCustomId('disabled_guess_button')
                        .setLabel('Guess')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                        .setEmoji(`${emojis.MAG}`)
                    const row = new ActionRowBuilder().setComponents(button);
                    interaction.channel.lastMessage.edit({embeds: [embed], components: [row]});

                    data[interaction.channel.id].solved = true;
                    fs.writeFileSync('data/spawns.json', JSON.stringify(data, null, 4));

                    let country = {
                        "name": data[interaction.channel.id].name,
                        "code": data[interaction.channel.id].code,
                    }
                    let dexs = JSON.parse(fs.readFileSync('data/countrydexs.json'));
                    if (dexs.hasOwnProperty(interaction.member.user.id)) {
                        dexs[interaction.member.user.id].push(country);
                    } else {
                        dexs[interaction.member.user.id] = [country];
                    }
                    fs.writeFileSync('data/countrydexs.json', JSON.stringify(dexs, null, 2));
                }
            }
        }

        if (interaction.isChatInputCommand()) {
            let command = client.commands.get(interaction.commandName);
            if (command) {
                try {
                    await command.execute(interaction, client);
                } catch (err) {
                    console.error(err);
                    interaction.reply(`[error]: ${err}`);
                }
            } else {
                interaction.reply(`this command doesnt exit`);
            }
        }

        if (interaction.isStringSelectMenu()) {
            await interaction.deferUpdate();
            const SELECT_ID = interaction.values[0];

            const FLAG = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'))[interaction.user.id].find(flag => flag.code === SELECT_ID);

            interaction.message.edit({ embeds: [new EmbedBuilder()
                .setAuthor({
                    iconURL: `${images.GLOBE}`,
                    name: `[${FLAG.code}] ${FLAG.name}`
                })
                .addFields([
                    {
                        name: 'Flag rank',
                        value: '#69',
                        inline: true
                    }, {
                        name: 'Rarity',
                        value: 'bof',
                        inline: true
                    }, { name: '\u200b', value: '\u200b', inline: true }, {
                        name: 'First time caught',
                        value: 'après demain',
                        inline: true
                    }, {
                        name: 'Last time caught',
                        value: 'demain',
                        inline: true
                    }, {
                        name: 'Count',
                        value: 'pi',
                        inline: false
                    }
                ])
                .setImage(`https://flagpedia.net/data/flags/w1160/${SELECT_ID}.jpg`)
            ], components: interaction.message.components })
        }
    }
}