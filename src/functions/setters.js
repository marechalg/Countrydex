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

const updateLanguageSql = fs.readFileSync('data/queries/language/update_language.sql', 'utf8');
const setLanguageSql = fs.readFileSync('data/queries/language/set_language.sql', 'utf8');
async function setUserLanguage(userId, lang) {
    try {
        console.log(`[DEBUG] userId: ${userId}, lang: ${lang}`);
        
        const result = await pdo.query('select 1 from countrydex._language where user_id = $1', [userId]);
        console.log(`[DEBUG] SELECT result.rows.length: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            const updateResult = await pdo.query(updateLanguageSql, [userId, lang]);
            console.log(`[DEBUG] UPDATE rowCount: ${updateResult.rowCount}`);
        } else {
            console.log(`[DEBUG] User not found, inserting...`);
            const insertResult = await pdo.query(setLanguageSql, [userId, lang]);
            console.log(`[DEBUG] INSERT rowCount: ${insertResult.rowCount}`);
        }
    } catch (err) {
        console.error(`[ERROR] setUserLanguage:`, err);
    }
}

module.exports = {
    newSpawn, solve, addToCountrydex, setUserLanguage
}