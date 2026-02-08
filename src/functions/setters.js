const fs = require('node:fs');
const pdo = require('./pdo');
const { getSpawn } = require('./getters');
const adlog = require('./adlog');
const moment = require('moment');

async function newSpawn(channelId, messageId, code) {
    const exists = await getSpawn(channelId);

    if (exists != null) {
        try {
            await pdo.query(fs.readFileSync('data/queries/update_spawn.sql', 'utf-8'), [channelId, messageId, code]);
        } catch (err) {
            adlog('error', 'pgsql', err.stack);
        }
    } else {
        try {
            await pdo.query(fs.readFileSync('data/queries/new_spawn.sql', 'utf-8'), [channelId, messageId, code]);
        } catch (err) {
            adlog('error', 'pgsql', err.stack);
        }
    }
}

async function solve(channelId) {
    try {
        await pdo.query(fs.readFileSync('data/queries/solve.sql', 'utf-8'), [channelId]);
    } catch (err) {
        adlog('error', 'pgsql', err.stack);
    }
}

async function addToCountrydex(userId, code) {
    try {
        await pdo.query(fs.readFileSync('data/queries/add.sql', 'utf-8'), [userId, code, moment.now()]);
    } catch (err) {
        adlog('error', 'pgsql', err.stack);
    }
}

module.exports = {
    newSpawn, solve, addToCountrydex
}