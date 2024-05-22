import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { SlashCommand } from "./types";
import { join } from "path/posix";
import { readdirSync } from "fs";
import { io, Socket } from "socket.io-client";
import {sendPreProgrammedMessage} from "./utils/preprogrammed-message/preprogrammed-message.ts";
import Sentry from "@sentry/node";
import {kickMember} from "./utils/moderation/kick.ts";
import {poll} from "./utils/poll/poll.ts";

export const discordClient: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

Sentry.init({
    dsn: process.env.SENTRY_DSN,
})

discordClient.commands = new Collection<string, SlashCommand>();

const __dirname: string = new URL(".", import.meta.url).pathname;
const handlerDirs: string = join(__dirname, "./handlers");

readdirSync(handlerDirs).forEach(async (file): Promise<void> => {
  const handler = await import(`${handlerDirs}/${file}`);
  handler.default(discordClient);
});

export const webSocket: Socket = io(process.env.WEBSOCKET_URL);

discordClient.login(process.env.TOKEN);

webSocket.on('error', (error) => {
    console.error('WebSocket error:', error);
});

webSocket.on('connect', () => {
    console.log('Connected to the web socket server');
})

// Handle incoming messages from the web socket server
webSocket.on('discordEvent', async (data): Promise<void> => {
    const {type, payload} = data;

    switch (type) {
        case "pre-programmed-message":
            await sendPreProgrammedMessage(payload.data);
            break;
        case "kick":
            await kickMember(payload.data);
            break;
        case "poll":
            await poll(payload.data);
            break;
    }
});