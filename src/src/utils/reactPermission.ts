import { TextChannel, type Message } from "discord.js";

//--- Remove @everyone's permission to add reactions ---//
export const removeEveryonePermission = async (message: Message) => {
  if (message.guild && message.channel instanceof TextChannel) {
    const everyoneRole = message.guild.roles.everyone;

    message.channel.permissionOverwrites.edit(everyoneRole, {
      AddReactions: false,
    });
  }
};

export const addEveryonePermission = async (message: Message) => {
  if (message.guild && message.channel instanceof TextChannel) {
    const everyoneRole = message.guild.roles.everyone;

    message.channel.permissionOverwrites.edit(everyoneRole, {
      AddReactions: true,
    });
  }
};
