const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');

const { images } = require('../../data/utils.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List of the countries capturable'),
    async execute(interaction, client) {
        let embeds = [];
        const countries = JSON.parse(fs.readFileSync('data/countries.json', 'utf-8'));
        let count = 0;
        let page = [];
        let pages = [];
        let nbPages = 0;
        countries.forEach(country => {
            page[count] = country.name;
            count++;
            if (count = 20) {
                count = 0;
                pages[nbPages] = page;
                nbPages++;
            }
        })
        pages.forEach(pg => {
            let list = new EmbedBuilder();
            if (embeds.length == 0) {
                list.setAuthor({
                    name: 'List of Countries',
                    iconURL: `${images.LIST}`
                })
            }
            list.setColor('Blurple')
            pg.forEach(country => {
                list.addFields({
                    name: `${country.name}`,
                    inline: true
                })
            })
            embeds.push(list);
        })
        interaction.reply('oui');
        console.log(embeds);
    }
}