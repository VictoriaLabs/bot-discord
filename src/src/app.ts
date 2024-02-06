import {Client, Collection, GatewayIntentBits} from "discord.js";
import type {SlashCommand} from "./types";
import {join} from "path/posix";
import {readdirSync} from "fs";
import {io, Socket} from "socket.io-client";

const discordClient: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

discordClient.commands = new Collection<string, SlashCommand>();

const __dirname: string = new URL('.', import.meta.url).pathname;
const handlerDirs: string = join(__dirname, './handlers');

readdirSync(handlerDirs).forEach(async file => {
   const handler = await import(`${handlerDirs}/${file}`);
    handler.default(discordClient);
});

discordClient.login(process.env.TOKEN);

const webSocket: Socket = io('http://localhost:3000');

webSocket.on('message', (data) => {
   const { type, payload } = data;

   switch (type) {
       case "pre-programmed-message":
           console.log(`Je reçois un message pre-programmé`);
           console.log(`Exemple pour get l'id de la guild: ${payload.data.guild}`);
   }
});