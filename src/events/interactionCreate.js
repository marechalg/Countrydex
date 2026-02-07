const { InteractionType, ComponentType, ApplicationCommandType } = require('discord.js');

const { adlog } = require('../functions/import');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute (interaction, client) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                switch (interaction.commandType) {
                    case ApplicationCommandType.ChatInput:
                        const chatInputHandler = require('./interactions/commands/chatInput');
                        await chatInputHandler.execute(interaction, client);
                        break;
                    default:
                        adlog('error', 'discord', `Unhandled interaction command type : ${interaction.commandType}`);
                        break;
                }
                break;

            case InteractionType.MessageComponent:
                switch (interaction.componentType) {
                    case ComponentType.Button:
                        const buttonHandler = require('./interactions/components/button');
                        await buttonHandler.execute(interaction, client);
                        break;
                    case ComponentType.StringSelect:
                        const stringSelectHandler = require('./interactions/components/stringSelect');
                        await stringSelectHandler.execute(interaction, client);
                        break;
                    default:
                        adlog('error', 'discord', `Unhandled interaction component type : ${interaction.componentType}`);
                        break;
                }
                break;

            case InteractionType.ModalSubmit:
                const modalHandler = require('./interactions/modal');
                await modalHandler.execute(interaction, client);
                break;

            default:
                adlog('error', 'discord', `Unhandled interaction type : ${interaction.type}`);
                break;
        }
    }
}