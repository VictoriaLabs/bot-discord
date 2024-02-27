import {TextChannel, type Message, Role} from "discord.js";
import Sentry from "@sentry/node";

//--- Remove @everyone's permission to add reactions ---//
export const removeEveryonePermission = async (message: Message): Promise<void> => {
  if (message.guild) {
    const channel: TextChannel = message.channel as TextChannel;
    const everyoneRole: Role = message.guild.roles.everyone;

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        AddReactions: false,
      });
    } catch (error) {
      Sentry.captureException(error, (scope) => {
        scope.setContext("function", {
          name: "removeEveryonePermission",
        });
        return scope;
      });
    }
  }
};

export const addEveryonePermission = async (message: Message): Promise<void> => {
  if (message.guild) {
    const channel: TextChannel = message.channel as TextChannel;
    const everyoneRole: Role = message.guild.roles.everyone;

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        AddReactions: true,
      });
    } catch (error) {
      Sentry.captureException(error, (scope) => {
        scope.setContext("function", {
          name: "addEveryonePermission",
        });
        return scope;
      });
    }
  }
};
