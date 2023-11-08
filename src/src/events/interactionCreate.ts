import {BotEvent, SlashCommand} from "../types";
import {Events, Interaction} from "discord.js";

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isCommand()) return;

        const command: SlashCommand | undefined = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}

export default event;