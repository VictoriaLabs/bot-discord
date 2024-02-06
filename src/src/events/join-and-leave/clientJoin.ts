import {type EmbedBuilder, Events, GuildMember, TextChannel} from "discord.js";
import { createJoinEmbed } from "../../utils/join-and-leave/clientJoinEmbed.ts";
import type { BotEvent } from "../../types";
import fs from "fs";

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember): Promise<void> {
    const rawData: string = fs.readFileSync("/usr/src/app/src/json/welcome.json", "utf-8");
    const data = JSON.parse(rawData);

    let { title, description, color } = data.embeds[0];
    const rulesChannelId: string = data.reglement;
    const channelId: string = data.channel;
    const channel: TextChannel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (channel) {
      try {
        createJoinEmbed(member, title, description, color, rulesChannelId).then((embed: EmbedBuilder): void => {
          channel.send({ embeds: [embed] });
        });
      } catch (error) {
        console.error(`Erreur lors de la création de l'embed Welcome: ${error}`);
      }
    }
  },
};

export default event;
