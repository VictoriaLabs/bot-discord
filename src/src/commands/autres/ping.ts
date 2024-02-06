import type { SlashCommand } from "../../types";
import { type CommandInteraction, SlashCommandBuilder } from "discord.js";

export const command: SlashCommand = {
  name: "ping",
  data: new SlashCommandBuilder().setName("ping").setDescription("Renvoi le ping du bot !"),
  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      await interaction.reply({
        content: `Mon ping est de: **${interaction.client.ws.ping}ms**`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
