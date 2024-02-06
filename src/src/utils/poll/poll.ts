import fs from "fs";
import { discordClient } from "../../app";
import { EmbedBuilder, TextChannel, Message } from "discord.js";
import { addReactions, createPollEmbed, sendPollEmbed } from "./displayPoll";
import { removeMessageAfterDeadline } from "./removePoll";
import { removeEveryonePermission } from "../reactPermission";
import { collectorReaction } from "./collectorReactionsPoll";
import moment from "moment-timezone";
import "moment/locale/fr";

export async function poll() {
  // READ JSON FILE
  const rawData: string = fs.readFileSync("/usr/src/app/src/json/poll.json", "utf8");
  const data = JSON.parse(rawData);

  // VERIFY GUILD & CHANNEL
  const guild = discordClient.guilds.cache.get(data.guild);
  if (!guild) {
    throw new Error(`Aucune guilde trouvée avec l'ID ${data.guild}`);
  }
  const channel = guild.channels.cache.get(data.channel) as TextChannel;
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

  const userChoiceMap = new Map();

  // DISPLAY POLL
  const embedMessage: EmbedBuilder = await createPollEmbed(allData);
  const message: Message = await sendPollEmbed(embedMessage, channel);
  await addReactions(message, allData.reactions);

  // REMOVE EVERYONE PERMISSION
  await removeEveryonePermission(message);

  // COLLECTOR REACTIONS AND UPDATE
  await collectorReaction(message, allData, userChoiceMap);

  // REMOVE MESSAGE AFTER DEADLINE
  removeMessageAfterDeadline(message, allData.deadline);
}