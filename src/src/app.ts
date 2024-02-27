import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { SlashCommand } from "./types";
import { join } from "path/posix";
import { readdirSync } from "fs";
import { io, Socket } from "socket.io-client";
import {sendPreProgrammedMessage} from "./utils/preprogrammed-message/preprogrammed-message.ts";
import Sentry from "@sentry/node";

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

discordClient.login(process.env.TOKEN);

export const webSocket: Socket = io('http://localhost:3000');

// Handle incoming messages from the web socket server
webSocket.on('message', async (data): Promise<void> => {
    const {type, payload} = data;

    switch (type) {
        case "pre-programmed-message":
            await sendPreProgrammedMessage(payload.data);
    }
});