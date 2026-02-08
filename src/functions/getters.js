const fs = require('node:fs');
const pdo = require('./pdo');

async function getCountries() {
    const countries = await pdo.query(fs.readFileSync('data/queries/countries.sql', 'utf-8'));
    return countries;
}

async function getSpawns() {
    const spawns = await pdo.query(fs.readFileSync('data/queries/spawns.sql', 'utf-8'));
    return spawns;
}

async function getSpawn(channelId) {
    const spawn = await pdo.query(fs.readFileSync('data/queries/spawn.sql', 'utf-8'), [channelId]);
    return spawn.rows[0] || null;
}

module.exports = {
    getCountries, getSpawns, getSpawn
}