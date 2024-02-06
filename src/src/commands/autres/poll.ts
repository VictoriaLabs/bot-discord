import type { SlashCommand } from "../../types";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { poll } from "../../utils/poll/poll";

export const command: SlashCommand = {
  name: "poll",
  data: new SlashCommandBuilder().setName("poll").setDescription("Créer un sondage"),
  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      await interaction.deferReply();
      setTimeout(async (): Promise<void> => {
        await poll();
        await interaction.deleteReply();
      }, 3000);
    } catch (error) {
      // TODO: Send the error to GlitchTip
      console.error(`Erreur lors de l'envoi du message : ${error}`);
    }
  },
};
