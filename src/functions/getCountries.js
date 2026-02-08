const fs = require('node:fs');
const { pdo } = require('./pdo');

async function getCountries() {
    const countries = await pdo.query(fs.readFileSync('data/queries/countries.sql', 'utf-8'));
    return countries;
}

module.exports = getCountries;