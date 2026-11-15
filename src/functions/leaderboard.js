const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

const pdo = require('../functions/pdo');
const { getCountries } = require('../functions/getters');
const { images } = require('../../data/utils.json');

const LB_TYPES = {
    lb_completion: {
        query: 'leaderboard_unique.sql',
        footer: 'Completion Leaderboard',
        value: (u, total) => `**${Math.floor(u.count * 100 / total)}**% *(${u.count}/${total})*`
    },
    lb_collection: {
        query: 'leaderboard_all.sql',
        footer: 'Collector Leaderboard',
        value: u => `**${u.count}** flags caught`
    },
    lb_quick_draw: {
        query: 'leaderboard_quick.sql',
        footer: 'Speed Leaderboard',
        value: u => `**${Math.floor(u.avg)}** min`
    }
};

async function isMember(guild, id) {
    if (guild.members.cache.has(id)) return true;
    try {
        await guild.members.fetch(id); // requête REST, pas de gateway
        return true;
    } catch {
        return false;
    }
}

async function buildLeaderboardEmbed(client, guild, type, scope) {
    const config = LB_TYPES[type];
    const countries = await getCountries();
    const leaderboard = await pdo.query(fs.readFileSync(`data/queries/${config.query}`, 'utf-8'));

    const top = [];
    for (const row of leaderboard.rows) {
        if (top.length >= 10) break;
        if (scope === 'local' && guild && !(await isMember(guild, String(row.owner)))) continue;
        top.push(row);
    }

    const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({ iconURL: `${images.PODIUM}`, name: 'Leaderboard' })
        .setFooter({ text: config.footer });

    const medals = ['🏆', '🥈', '🥉'];
    for (const [i, userInfos] of top.entries()) {
        const user = await client.users.fetch(userInfos.owner);
        embed.addFields({
            name: `${medals[i] ?? '#' + (i + 1)} ${user.username}`,
            value: config.value(userInfos, countries.rowCount)
        });
    }
    if (!top.length) embed.setDescription('Aucun joueur.');

    return embed;
}

module.exports = { LB_TYPES, buildLeaderboardEmbed };