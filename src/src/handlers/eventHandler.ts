import { join } from "path/posix";
import { readdirSync, statSync } from "fs";
import type { Client } from "discord.js";
import type { BotEvent } from "../types";

export default (client: Client): void => {
    const __dirname: string = new URL('.', import.meta.url).pathname;
    const eventsDir: string = join(__dirname, '../events');

    const loadEvents = (dir: string): void => {
        readdirSync(dir).forEach(file => {
            const fullPath: string = join(dir, file);
            if (statSync(fullPath).isDirectory()) {
                loadEvents(fullPath);
            } else {
                if (!file.endsWith('.ts')) return;
                const event: BotEvent = require(fullPath).default;
                event.once ? client.once(event.name, (...args: any[]) => event.execute(...args)) : client.on(event.name, (...args: any[]) => event.execute(...args));
            }
        });
    };

    loadEvents(eventsDir);
};
