const { Client, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('node:fs');
const moment = require('moment');

const { adlog, m } = require('./functions/import');

const { keys, ids } = require('../data/config.json');

// CRASH LOGS
function getCrashLogFile(errorType) {
    const timestamp = moment().format('YYYY-MM-DD_HH:mm:ss');
    return `${errorType}_${timestamp}.log`;
}

process.on('uncaughtException', error => {
    adlog('error', 'node', `Uncaught Exception : ${error.message}`);
    fs.appendFile(`logs/${getCrashLogFile(error.name)}`, error.stack, () => {
        adlog('error', 'node', 'Crash log saved. Exiting...');
        process.exit(1);  
    })
})

process.on('unhandledRejection', (reason, promise) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : `Rejection: ${message}`;
    const name = reason instanceof Error ? reason.name : 'UnhandledRejection';

    adlog('error', 'node', `Unhandled Rejection : ${message}`);
    fs.appendFile(`logs/${getCrashLogFile(name)}`, stack, () => {
        adlog('error', 'node', 'Rejection log saved.');
    })
})

console.clear(), adlog('info', 'node', 'Executing...');

//LOGIN
adlog('info', 'discord', 'Connecting...');
const client = new Client({ intents: [keys.DISCORD_INTENTS], rest: { timeout: m(1) } });
client.login(keys.DISCORD_TOKEN).catch(err => console.error(err));

//EVENTS HANDLING
client.events = new Collection();
const eventFiles = fs.readdirSync('src/events').filter(file => file.endsWith('.js'));
adlog('info', 'fs', `Loading ${eventFiles.length} events...`);
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if ('name' in event && 'execute' in event) {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        client.events.set(event.name, event);
    } else {
        adlog('warn', 'fs', `Missing data in ${file} event`);
    }
}
adlog('log', 'fs', `Loaded ${client.events.size} events (${client.events.map(event => event.name).join(', ')})`);

//COMMANDS HANDLING
client.commands = new Collection();
const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.js'));
adlog('info', 'fs', `Loading ${commandFiles.length} commands...`);
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        adlog('warn', 'fs', `Missing data in ${file} command`);
    }
}
adlog('log', 'fs', `Loaded ${client.commands.size} commands (${client.commands.map(cmd => cmd.data.name).join(', ')})`);

//COMMANDS RESGISTERING
adlog('info', 'discord', `Registering ${client.commands.size} commands...`);
const rest = new REST({ version: '10' }).setToken(`${keys.DISCORD_TOKEN}`);
(async () => {
    try {
        let data = await rest.put(Routes.applicationCommands(`${ids.DISCORD_CLIENT_ID}`), {
            body: client.commands.map(cmd => cmd.data.toJSON())
        })
        adlog('log', 'discord', `Registered ${data.length} commands (${data.map(cmd => cmd.name).join(', ')})`);
    } catch (err) {
        adlog('error', 'discord', err);
    }
})();