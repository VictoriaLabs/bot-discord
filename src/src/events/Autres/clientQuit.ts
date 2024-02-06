import { Events, GuildMember, TextChannel } from "discord.js";
import { createWelcomeEmbed } from "../../utils/clientQuitEmbed";
import type { BotEvent } from "../../types";
import fs from "fs";

const event: BotEvent = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember): Promise<void> {
    const rawData: string = fs.readFileSync("/usr/src/app/src/json/clientQuit.json", "utf-8");
    const data = JSON.parse(rawData);

    let { title, description, color, thumbnail } = data.embeds[0];
    const channelId: string = data.channel;
    const channel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (channel) {
      try {
        createWelcomeEmbed(member, title, description, color).then((embed) => {
          channel.send({ embeds: [embed] });
        });
      } catch (error) {
        console.error(`Erreur lors de la création de l'embed quit: ${error}`);
      }
    }
  },
};

export default event;
