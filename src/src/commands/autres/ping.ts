import type { SlashCommand } from "../../types";
import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import Sentry from "@sentry/node";
import {sendErrorMessage} from "../../utils/others/errorMessage.ts";

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
      Sentry.captureException(error, (scope) => {
        scope.setContext("command", {
          name: "ping",
        });
        return scope;
      });
      await sendErrorMessage(interaction.replied, interaction);
    }
  },
};
