import { SlashCommand } from "../types";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { calculatePollTimeLeft } from "../utils/utils";
import fs from "fs";

export const command: SlashCommand = {
  name: "poll",
  data: new SlashCommandBuilder().setName("poll").setDescription("Créer un sondage"),

  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      let rawData: string = fs.readFileSync("/usr/src/app/src/json/poll.json", "utf8");
      let data = JSON.parse(rawData);
      const embed: EmbedBuilder = new EmbedBuilder(data.embeds[0]);
      //todo Ajout a la DB
      let message = await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });

      let couldown = calculatePollTimeLeft(new Date("2023-11-15T15:48:00.000Z"));

      setTimeout(() => {
        message.delete();
      }, couldown);
    } catch (error) {
      console.error(error);
    }
  },
};
