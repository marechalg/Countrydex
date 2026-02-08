const fs = require('node:fs');
const pdo = require('./pdo');
const { getSpawn } = require('./getters');
const adlog = require('./adlog');

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

module.exports = {
    newSpawn
}