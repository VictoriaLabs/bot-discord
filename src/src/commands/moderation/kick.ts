import type {SlashCommand} from "../../types";
import {
    SlashCommandBuilder,
    PermissionsBitField,
    type CommandInteraction,
    type User,
} from "discord.js";
import Sentry from "@sentry/node";
import {webSocket} from "../../app.ts";

export const command: SlashCommand = {
    name: "kick",
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .addUserOption((option) => {
            return option
                .setName("user")
                .setDescription("The user to kick")
                .setRequired(true);
        })
        .addStringOption((option) => {
            return option
                .setName("reason")
                .setDescription("The reason for the kick")
                .setRequired(true);
        }),
    execute: async (interaction: CommandInteraction): Promise<void> => {
        if (!interaction.guild) return;
        if (!interaction.isChatInputCommand()) return;
        const user: User = interaction.options.getUser("user", true);
        const reason: string = interaction.options.getString("reason", true);

        if (interaction.user.id) {
            try {
                await interaction.deferReply({ephemeral: true});
                // Ask via web socket for message to be sent
                webSocket.emit("discordEvent", {
                    type: "ask-kick",
                    payload: {
                        guild: "1171832529486094369",
                        userTokick: user.id,
                        moderator: interaction.user.id,
                        reason: reason,
                        actualChannel: interaction.channelId,
                        replyTo: interaction.id,
                    }
                });
            } catch (error) {
                await interaction.reply({
                    content: "Une erreur est survenue, veuillez réessayer plus tard.",
                    ephemeral: true,
                });
                Sentry.captureException(error);
            }
        } else {
            await interaction.reply({
                content: "Une erreur est survenue, veuillez réessayer plus tard.",
                ephemeral: true,
            });
            Sentry.captureMessage("Kick author not found in guild. This should not happen.");
        }

    }
}