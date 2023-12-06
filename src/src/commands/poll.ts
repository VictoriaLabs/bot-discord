import { SlashCommand } from "../types";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { calculatePollTimeLeft } from "../utils/utils";
import fs from "fs";
import moment from "moment-timezone";
import "moment/locale/fr";

export const command: SlashCommand = {
  name: "poll",
  data: new SlashCommandBuilder().setName("poll").setDescription("Créer un sondage"),

  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      const rawData: string = fs.readFileSync("/usr/src/app/src/json/poll.json", "utf8");
      let data = JSON.parse(rawData);

      let { description, reactions, deadline } = data.embeds[0];

      const deadlineDate = new Date(deadline);
      const deadlineMoment = moment(deadlineDate).tz("Europe/Paris").locale("fr");
      const couldown = calculatePollTimeLeft(deadlineDate);

      description += `Se termine le ${deadlineMoment.format("dddd D MMMM YYYY")} à ${deadlineMoment.format("HH:mm")}`;

      const embed: EmbedBuilder = new EmbedBuilder({
        ...data.embeds[0],
        description,
      });

      const message = await interaction.reply({
        embeds: [embed],
        ephemeral: false,
        fetchReply: true,
      });

      for (const reaction of reactions) {
        await message.react(reaction.emoji);
      }

      setTimeout(() => {
        message.delete();
      }, couldown);
    } catch (error) {
      console.error(error);
    }
  },
};
