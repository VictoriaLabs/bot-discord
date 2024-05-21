import type {BotEvent} from "../../types";
import {type Client, Events, ActivityType} from "discord.js";
import Sentry from "@sentry/node";

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        try {
            client.user?.setPresence({
               status: 'online',
               afk: false,
               activities: [{
                   name: 'les devs',
                   type: ActivityType.Watching
               }]
            });

            console.log(`Je suis actuellement en ligne en tant que ${client.user?.tag}`);
        } catch (error) {
            Sentry.captureException(error, (scope) => {
                scope.setContext("event", {
                    name: "clientReady",
                });
                return scope;
            });
            console.error(error);
        }
    }
}

export default event;