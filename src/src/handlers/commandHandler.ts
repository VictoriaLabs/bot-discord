import {readdirSync, Stats, statSync} from "fs";
import {join} from "path/posix";
import {REST, Client, Routes, type Snowflake} from "discord.js";

const registerCommands = async (client: Client, commandsDir: string): Promise<void> => {
    const body: any = [];

    const readCommands = (dir: string): void => {
        const files: string[] = readdirSync(dir);

        for (const file of files) {
            const filePath: string = join(dir, file);
            const stat: Stats = statSync(filePath);

            if (stat.isDirectory()) {
                readCommands(filePath);
            } else if (file.endsWith('.ts')) {
                const command = require(filePath).command;
                body.push(command.data.toJSON());
                client.commands.set(command.name, command);
            }
        }
    };

    readCommands(commandsDir);

    const rest: REST = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        await rest.put(Routes.applicationCommands(<Snowflake>'1171831963364106362'), { body });
    } catch (error) {
        console.error(error);
    }
};

export default async (client: Client): Promise<void> => {
    const __dirname: string = new URL('.', import.meta.url).pathname;
    const commandsDir: string = join(__dirname, '../commands');

    client.commands.clear();

    await registerCommands(client, commandsDir);
};