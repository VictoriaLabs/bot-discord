import {Client, REST, Routes} from "discord.js";
import {join} from "path";
import {readdirSync} from "fs";

module.exports = async (client: Client): Promise<void> => {
    const body: any = [];
    let commandsDir: string = join(__dirname, '../commands');

    readdirSync(commandsDir).forEach(file => {
        if (!file.endsWith('.js')) return;

        const command = require(`${commandsDir}/${file}`).command;

        body.push(command.data.toJSON());
        client.commands.set(command.name, command);

    });

    const rest: REST = new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body });
    } catch (error) {
        console.error(error);
    }
}