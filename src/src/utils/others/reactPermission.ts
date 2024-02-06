import {TextChannel, type Message, Role} from "discord.js";

//--- Remove @everyone's permission to add reactions ---//
export const removeEveryonePermission = async (message: Message): Promise<void> => {
  if (message.guild) {
    const channel: TextChannel = message.channel as TextChannel;
    const everyoneRole: Role = message.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyoneRole, {
      AddReactions: false,
    });
  }
};

export const addEveryonePermission = async (message: Message): Promise<void> => {
  if (message.guild) {
    const channel: TextChannel = message.channel as TextChannel;
    const everyoneRole: Role = message.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyoneRole, {
      AddReactions: true,
    });
  }
};
