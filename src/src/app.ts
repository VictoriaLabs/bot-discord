import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { SlashCommand } from "./types";
import { join } from "path/posix";
import { readdirSync } from "fs";

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

discordClient.commands = new Collection<string, SlashCommand>();

const __dirname: string = new URL(".", import.meta.url).pathname;
const handlerDirs: string = join(__dirname, "./handlers");

readdirSync(handlerDirs).forEach(async (file) => {
  const handler = await import(`${handlerDirs}/${file}`);
  handler.default(discordClient);
});

discordClient.login(Bun.env.TOKEN);
