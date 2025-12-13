import { Client } from 'discord.js';
import { handleReady } from './ready';
import { handleGuildMemberAdd } from './guildMemberAdd';
import { handleMessageCreate } from './messageCreate';
import { handleMessageReactionAdd } from './messageReactionAdd';

export function setupEventHandlers(client: Client) {
    client.on('ready', () => handleReady(client));
    client.on('guildMemberAdd', handleGuildMemberAdd);
    client.on('messageCreate', handleMessageCreate);
    client.on('messageReactionAdd', handleMessageReactionAdd);
}
