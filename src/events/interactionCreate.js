const { emojis, images } = require('../../data/utils.json');

const {
    ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ButtonStyle, EmbedBuilder, ButtonBuilder
} = require('discord.js');
const fs = require('node:fs');
const moment = require('moment');

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
                const spawns = JSON.parse(fs.readFileSync('data/spawns.json'));

                if (neutralize(spawns[interaction.channel.id].name) == neutralize(answer) || neutralize(spawns[interaction.channel.id].code) == neutralize(answer)) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Found by ${interaction.member.user.username}`)
                        .setDescription(`The flag was **${spawns[interaction.channel.id].name}**`)
                        .setImage(`https://flagpedia.net/data/flags/w1160/${spawns[interaction.channel.id].code}.webp`)
                        .setColor(`${spawns[interaction.channel.id].color}`)
                    const button = new ButtonBuilder()
                        .setCustomId('disabled_guess_button')
                        .setLabel('Guess')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                        .setEmoji(`${emojis.MAG}`)
                    const row = new ActionRowBuilder().setComponents(button);
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    messages.find(msg => msg.id === spawns[interaction.channel.id].messageId).edit({embeds: [embed], components: [row]});

                    spawns[interaction.channel.id].solved = true;
                    fs.writeFileSync('data/spawns.json', JSON.stringify(spawns, null, 4));

                    let dexs = JSON.parse(fs.readFileSync('data/countrydexs.json'));

                    let country = {
                        "name": spawns[interaction.channel.id].name,
                        "code": spawns[interaction.channel.id].code,
                        "color": spawns[interaction.channel.id].color,
                        "date": moment.now()
                    }
                    
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
    
            const ownerId = interaction.customId.split('_')[1] || interaction.user.id;
    
            const dexData = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'))[ownerId];
    
            if (!dexData) {
                return interaction.followUp({ content: 'Dex data not found.', ephemeral: true });
            }
    
            const flags = dexData.filter(flag => flag.code === SELECT_ID);
    
            if (flags.length === 0) {
                return interaction.followUp({ content: 'This flag was not found in this dex.', ephemeral: true });
            }
    
            const FLAG = flags[0];
            const count = flags.length;
            const dates = flags.map(f => f.date).sort((a, b) => a - b);
            const firstCaught = dates[0];
            const lastCaught = dates[dates.length - 1];

            let lb = [];
            const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
            for (const [usr, dex] of Object.entries(dexs)) {
                const flags = dex.filter(flag => flag.code === SELECT_ID);
                let c = flags.length;
                let firstDate = flags.length > 0 ? Math.min(...flags.map(f => f.date)) : Infinity;
                lb.push({id: usr, count: c, firstCaught: firstDate});
            }
            lb.sort((a, b) => b.count - a.count || a.firstCaught - b.firstCaught);

            const rank = lb.findIndex(entry => entry.id === ownerId) + 1;

            interaction.message.edit({ embeds: [new EmbedBuilder()
                .setAuthor({
                    iconURL: `${images.GLOBE}`,
                    name: `[${FLAG.code}] ${FLAG.name}`
                })
                .addFields([
                    {
                        name: 'First time caught',
                        value: `<t:${Math.floor(firstCaught / 1000)}:R>`,
                        inline: true
                    }, {
                        name: 'Last time caught',
                        value: `<t:${Math.floor(lastCaught / 1000)}:R>`,
                        inline: true
                    }, { name: '\u200b', value: '\u200b', inline: true }, 
                    {
                        name: 'Count',
                        value: `**${count}**`,
                        inline: true
                    }, {
                        name: 'Flag rank',
                        value: `#**${rank}**`,
                        inline: true
                    }, { name: '\u200b', value: '\u200b', inline: true }
                ])
                .setColor(`${FLAG.color}`)
                .setImage(`https://flagpedia.net/data/flags/w1160/${SELECT_ID}.jpg`)
            ], components: interaction.message.components })
        }
    }
}