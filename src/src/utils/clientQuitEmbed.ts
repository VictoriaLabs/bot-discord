import { EmbedBuilder, GuildMember } from "discord.js";

export const createWelcomeEmbed = async (member: GuildMember, title: string, description: string, color: any): Promise<EmbedBuilder> => {
  const embed = new EmbedBuilder({
    title: title.replace("{member}", member.user.username),
    description: description,
    color: color,
    image: {
      url: member.user.displayAvatarURL(),
    },
  });
  return embed;
};
