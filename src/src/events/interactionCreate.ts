import type {BotEvent, SlashCommand} from "../types";
import {Events, type Interaction} from "discord.js";
import Sentry from "@sentry/node";

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command: SlashCommand | undefined = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            Sentry.captureException(error, (scope) => {
                scope.setContext("event", {
                    name: "interactionCreate",
                });
                return scope;
            });
        }
    }
}

export default event;