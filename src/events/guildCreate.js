const { PermissionFlagsBits, ChannelType } = require('discord.js');

const { adlog } = require('../functions/import');

const { SPAWN } = require('../../data/config.json');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        if (!guild.channels.cache.find(chnl => chnl.name.includes(SPAWN))) {
            const clientAsMember = await guild.members.fetchMe();
            if (clientAsMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                guild.channels.create({
                    type: ChannelType.GuildText,
                    name: SPAWN,
                    reason: 'Essential for Countrydex to work'
                }).then (chnl => {
                    chnl.send('> **This channel was created to set a spawn place for flags. You can move it wherever you want, and you can add fioritures while "spawning" remains in the name.**');
                }).catch (err => { adlog('error', 'discord', err) });
            } else {
                try {
                    const owner = await guild.fetchOwner();
                    await owner.send('> **Countrydex needs a channel with a name including spawning to work. You can put it wherever you want, and you can add fioritures while "spawning" remains in the name.**')
                } catch {}
            }
        }
    }
}