const countries = require('../data/countries.json');
const { keys } = require('../data/config.json');

const deepl = require('deepl-node');
const tl = new deepl.Translator(keys.DEEPL_API_KEY);

const fs = require('node:fs');

const delay = ms => new Promise(res => setTimeout(res, ms));

async () => {
    const translatedCountries = [];
    for (let i = 0; i < countries.length; i++) {
        const country = countries[i];
        console.log(`Treating (${i + 1}/${countries.length}) : ${country.name}`);
        try {
            const result = await tl.translateText(country.name, null, 'fr');
            country.name = result.text;
            country.code = country.code.toLowerCase();
            translatedCountries.push(country);
        } catch (error) {
            console.error(`Error translating ${country.name}:`, error);
            translatedCountries.push(country);
        }
        await delay(1000);
    }
    fs.writeFileSync('data/countries.json', JSON.stringify(translatedCountries, null, 4));
    console.log('All flags treated');
}