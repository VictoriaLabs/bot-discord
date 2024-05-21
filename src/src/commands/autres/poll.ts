import type { SlashCommand } from "../../types";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { poll } from "../../utils/poll/poll";
import Sentry from "@sentry/node";
import {sendErrorMessage} from "../../utils/others/errorMessage.ts";

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
      Sentry.captureException(error, (scope) => {
        scope.setContext("command", {
          name: "poll",
        });
        return scope;
      });
      await sendErrorMessage(interaction.replied, interaction);
    }
  },
};
