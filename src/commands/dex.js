const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const Vibrant = require('node-vibrant');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dex')
        .setDescription('Display the content of your Countrydex'),
    async execute(interaction, client) {
        let embeds = [];

        embeds.push(new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}'s Countrydex`,
                iconURL: `${images.DEX}`
            })
        )

        const dexs = JSON.parse(fs.readFileSync('data/countrydexs.json', 'utf-8'));
        const dex = dexs[interaction.user.id];
        dex.forEach(dx => {
            new Vibrant(`https://flagpedia.net/data/flags/w1160/${dx.code}.jpg`).getPalette().then(p => {
                const color = p.Vibrant.hex;
                embeds.push(new EmbedBuilder()
                    .setColor(color)
                    .setAuthor({
                        iconURL: `https://flagpedia.net/data/flags/w1160/${dx.code}.jpg`,
                        name: `${dx.name}`
                    })
                )
            })
        })

        await interaction.reply({ embeds: [embeds] });
    }
}