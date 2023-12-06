import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import {SlashCommand} from "./types";
import { join } from 'path';
import {readdirSync} from "fs";
import {io, Socket} from 'socket.io-client';
import {sendProgrammedMessage} from "./utils/on-programmed-message";

dotenv.config();

const discordClient: Client = new Client({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ],
});

discordClient.commands = new Collection<string, SlashCommand>();

const handlerDirs: string = join(__dirname, './handlers');
readdirSync(handlerDirs).forEach(file => {
    require(`${handlerDirs}/${file}`)(discordClient);
});

discordClient.login(process.env.DISCORD_TOKEN);

const ws: Socket = io('http://localhost:3000');

ws.on('embed', (arg): void => {
    sendProgrammedMessage(arg, discordClient);
})