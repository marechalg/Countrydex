const { delay, pdo, adlog, m } = require('../src/functions/import');
const { Client } = require('discord.js');
const { keys } = require('../data/config.json');

const client = new Client({ intents: [keys.DISCORD_INTENTS], rest: { timeout: m(1) } });
client.login(keys.DISCORD_TOKEN).catch(err => console.error(err));

client.once('clientReady', () => {
    (async () => {
        try {
            await pdo.query('alter table countrydex._spawn add column server bigint');
            adlog('log', 'col-creation', 'Added column server');
        } catch (err) {
            adlog('error', 'col-creation', err);
        }

        const rows = await pdo.query(`select * from countrydex._spawn`);
        for (const row of rows.rows) {
            try {
                const ch = await client.channels.fetch(String(row.channel));
                await pdo.query('update countrydex._spawn set server = $1 where channel = $2', [ch.guildId, row.channel]);
                adlog('log', 'row-update', `Updated ${row.channel} -> ${ch.guildId}`);
            } catch (err) {
                adlog('error', 'row-update', `${row.channel}: ${err}`);
            }
            await delay(250);
        }

        try {
            await pdo.query('alter table countrydex._spawn drop constraint _spawn_pkey, add primary key (server)');
            adlog('log', 'pk-change', 'Changed primary key to the server');
        } catch (err) {
            adlog('error', 'pk-change', err);
        }

        client.destroy();
        process.exit(0);
    })().catch(err => {
        adlog('error', 'unknown', err);
        process.exit(0);
    })
})