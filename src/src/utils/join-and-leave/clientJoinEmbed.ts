import {EmbedBuilder, GuildMember} from "discord.js";

export const createJoinEmbed = async (member: GuildMember, title: string, description: string, color: any, rulesChannelId: string): Promise<EmbedBuilder> => {
    return new EmbedBuilder({
        title: title,
        description: description.replace("{member}", member.toString()).replace("{reglement}", `<#${rulesChannelId}>`).replace("{memberCount}", member.guild.memberCount.toString()),
        color: color,
        thumbnail: {
            url: member.user.displayAvatarURL(),
        },
    });
};