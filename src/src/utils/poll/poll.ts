import { discordClient } from "../../app";
import {EmbedBuilder, TextChannel, Message, type Guild} from "discord.js";
import { addReactions, createPollEmbed, sendPollEmbed } from "./displayPoll";
import { removeMessageAfterDeadline } from "./removePoll";
import { removeEveryonePermission } from "../others/reactPermission.ts";
import { collectorReaction } from "./collectorReactionsPoll";
import moment from "moment-timezone";
import "moment/locale/fr";

export async function poll(data: any): Promise<void> {

  // VERIFY GUILD & CHANNEL
  const guild: Guild | undefined = discordClient.guilds.cache.get(data.guild);
  if (!guild) {
    throw new Error(`Aucune guilde trouvée avec l'ID ${data.guild}`);
  }
  const channel: TextChannel = guild.channels.cache.get(data.channel) as TextChannel;
  if (!channel) {
    throw new Error(`Aucun salon trouvé avec l'ID ${data.channel}`);
  }

  // EXTRACT DATA
  const { title, description, color, footer, timestamp, choices, multiple, reactions, deadline } = data.embeds[0];
  const allData = {
    title,
    description,
    color,
    footer,
    timestamp: new Date().toISOString(),
    choices,
    multiple,
    reactions,
    deadline: moment(deadline).tz("Europe/Paris").locale("fr"),
  };

  const userChoiceMap: Map<any, any> = new Map();

  // DISPLAY POLL
  const embedMessage: EmbedBuilder = await createPollEmbed(allData);
  const message: Message = await sendPollEmbed(embedMessage, channel);
  await addReactions(message, allData.reactions);

  // REMOVE EVERYONE PERMISSION
  await removeEveryonePermission(message);

  // COLLECTOR REACTIONS AND UPDATE
  await collectorReaction(message, allData, userChoiceMap);

  // REMOVE MESSAGE AFTER DEADLINE
  await removeMessageAfterDeadline(message, allData.deadline);
}
