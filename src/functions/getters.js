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

async function getCaught(userId, code) {
    const caught = await pdo.query(fs.readFileSync('data/queries/caught.sql', 'utf-8'), [userId, code]);
    return caught;
}

async function getFirstCaught(userId, code) {
    const time = await pdo.query(fs.readFileSync('data/queries/first_caught.sql', 'utf-8'), [userId, code]);
    return time.rows[0];
}

async function getLastCaught(userId, code) {
    const time = await pdo.query(fs.readFileSync('data/queries/last_caught.sql', 'utf-8'), [userId, code]);
    return time.rows[0];
}

module.exports = {
    getCountries, getSpawns, getSpawn, getCaught, getFirstCaught, getLastCaught
}