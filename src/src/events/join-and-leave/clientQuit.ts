import {type EmbedBuilder, Events, GuildMember, TextChannel} from "discord.js";
import { createLeaveEmbed } from "../../utils/join-and-leave/clientLeaveEmbed.ts";
import type { BotEvent } from "../../types";
import fs from "fs";
import Sentry from "@sentry/node";

const event: BotEvent = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember): Promise<void> {
    const rawData: string = fs.readFileSync("/usr/src/app/src/json/clientQuit.json", "utf-8");
    const data = JSON.parse(rawData);

    let { title, description, color } = data.embeds[0];
    const channelId: string = data.channel;
    const channel: TextChannel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (channel) {
      try {
        createLeaveEmbed(member, title, description, color).then((embed: EmbedBuilder): void => {
          channel.send({ embeds: [embed] });
        });
      } catch (error) {
        Sentry.captureException(error, (scope) => {
          scope.setContext("event", {
            name: "clientQuit",
          });
          return scope;
        });
      }
    }
  },
};

export default event;
