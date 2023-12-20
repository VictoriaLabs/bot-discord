import { SlashCommand } from "../types";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { createPoll } from "../utils/pollUtils";

//--- COMMANDE ---//
export const command: SlashCommand = {
  name: "poll",
  data: new SlashCommandBuilder().setName("poll").setDescription("Créer un sondage"),

  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      createPoll();
    } catch (error) {
      console.error(error);
    }
  },
};
