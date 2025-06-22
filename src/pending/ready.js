const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const fs = require('node:fs');
const vibrant = require('node-vibrant');
const moment = require('moment');

const { adlog, h } = require('../functions');

const countries = require('../../data/countries.json');
const { emojis } = require('../../data/utils.json');

module.exports = {
    name: 'ready',
    once: true,
    execute(args, client) {
        adlog('log', 'discord', `Connected to ${client.user.tag}`);

        const spawnDelay = h(6);
        const backupDelay = h(1);
        let actual = moment.now();

        setInterval(() => {
            let spawnGoal = actual + spawnDelay;
            let backupGoal = actual + backupDelay;
            if ()
        }, 1e3)
    }
}