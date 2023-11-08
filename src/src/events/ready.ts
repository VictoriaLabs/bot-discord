import {BotEvent} from "../types";
import {Client, Events, ActivityType} from "discord.js";

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {

        /*
        Status du bot
         */
        client.user?.setPresence({
            status: "online",
            afk: false,
            activities: [{
                name: "mazigh se doucher",
                type: ActivityType.Watching
            }]
        });

        console.log(`Connecté en tant que ${client.user?.tag} !`);

    }
}

export default event;