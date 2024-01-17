import client from "../app";
import { CommandInteraction, EmbedBuilder, GuildMember, Message, MessageReaction, TextChannel, User } from "discord.js";
import fs from "fs";
import moment from "moment-timezone";
import "moment/locale/fr";

//--- INTERFACES ---//
interface CommandData {
  description: string;
  choices: string[];
  reactions: MessageReaction[];
  deadlineMoment: moment.Moment;
  multiple: boolean;
}

interface EmbedData {
  data: any;
  description: string;
  interaction: CommandInteraction;
  guildId: string;
  channelId: string;
}

interface PermissionData {
  message: Message;
}

const userChoiceMap = new Map<User, MessageReaction[]>();

//--- CALCULATE POLL TIME LEFT ---//
function calculatePollTimeLeft(endDate: Date): number {
  const today = new Date();
  const diff = endDate.getTime() - today.getTime();
  return diff;
}

//--- DESCRIPTION ---//
const createDescription = async ({ description, choices, reactions, deadlineMoment, multiple }: CommandData) => {
  description += "**Choix**";
  for (let i = 0; i < choices.length; i++) {
    description += `\n${reactions[i].emoji}  ${choices[i]} `;
  }

  description += "\n\n**Résultats**\n";

  let totalVotes = 0;
  for (const reaction of reactions) {
    if (!reaction.me) {
      totalVotes += reaction.count - 1;
    }
  }

  for (let i = 0; i < choices.length; i++) {
    const percentage = ((reactions[i].count - 1) / totalVotes) * 100 || 0;
    let progressBar = "";
    for (let j = 0; j < percentage / 10; j++) {
      progressBar += "█";
    }
    for (let j = 0; j < 10 - percentage / 10; j++) {
      progressBar += "░";
    }
    let emoji = reactions[i].emoji;
    let countVotes = Math.abs(reactions[i].count - 1);
    let percentageVotes = percentage.toFixed(0);
    description += `${emoji}  ${progressBar}  [${countVotes}  •  ${percentageVotes}%]\n`;
  }

  description += `Total votes : ${Math.abs(totalVotes)}`;

  description += "\n\n**Infos**\n";
  description += `⏰  Fin : ${deadlineMoment.format("dddd D MMMM YYYY")} à ${deadlineMoment.format("HH:mm")}\n`;
  description += `🔢  Choix : ${multiple ? "multiple" : "unique"}\n\n  `;

  return description;
};

//--- EMBED ---//
const sendEmbed = async ({ data, description, guildId, channelId }: EmbedData) => {
  const embed = new EmbedBuilder({
    ...data.embeds[0],
    description,
  });

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(`Guild with id ${guildId} not found`);
  }
  const channel = guild.channels.cache.get(channelId) as TextChannel;

  const message = await channel.send({
    embeds: [embed],
  });

  return message;
};

//--- UPDATE DESCRIPTION ---//
const updatedDescription = async (message: Message, data: any, multiple: boolean) => {
  try {
    const reactions = message.reactions.cache;

    let updatedDescription = await createDescription({
      description: data.embeds[0].description,
      choices: data.embeds[0].choices,
      reactions: Array.from(reactions.values()),
      deadlineMoment: moment(data.embeds[0].deadline),
      multiple,
    });

    const embed: EmbedBuilder = new EmbedBuilder({
      ...data.embeds[0],
      description: updatedDescription,
    });

    await message.edit({
      embeds: [embed],
    });
  } catch (error) {
    console.error(error);
  }
};

//--- Remove @everyone's permission to add reactions ---//
const removeEveryonePermission = async ({ message }: PermissionData) => {
  if (message.guild && message.channel instanceof TextChannel) {
    const everyoneRole = message.guild.roles.everyone;

    message.channel.permissionOverwrites.edit(everyoneRole, {
      AddReactions: false,
    });
  }
};

//--- ON REACTIONS ---//
const handleOnReactions = async (reaction: MessageReaction, user: User, multiple: boolean, message: Message, data: any) => {
  const userReactions = userChoiceMap.get(user);

  if (userReactions) {
    if (multiple) {
      userReactions.push(reaction);
    } else {
      for (const userReaction of userReactions) {
        await userReaction.users.remove(user.id);
      }
      userReactions[0] = reaction;
    }
  } else {
    userChoiceMap.set(user, [reaction]);
  }
};

//--- REMOVE REACTIONS ---//
const handleRemoveReactions = async (reaction: MessageReaction, user: User) => {
  const userReactions = userChoiceMap.get(user);

  if (userReactions) {
    const index = userReactions.indexOf(reaction);
    if (index !== -1) {
      userReactions.splice(index, 1);
    }
  }
};

//-------------------- EXPORTS --------------------//

//--- MAIN FUNCTION ---//
export const createPoll = async (): Promise<void> => {
  try {
    const rawData: string = fs.readFileSync("/usr/src/app/src/json/poll.json", "utf8");
    const data = JSON.parse(rawData);

    //--- DATA ---//
    let { description, choices, reactions, deadline, multiple } = data.embeds[0];
    const guildId: string = data.guild;
    const channelId: string = data.channel;

    const interaction = data;
    const deadlineDate = new Date(deadline);
    const deadlineMoment = moment(deadlineDate).tz("Europe/Paris").locale("fr");
    const couldown = calculatePollTimeLeft(deadlineDate);

    description = await createDescription({ description, choices, reactions, deadlineMoment, multiple });
    const message = await sendEmbed({ data, description, guildId, channelId, interaction });
    await removeEveryonePermission({ message });

    //--- REACTIONS ---//
    for (const reaction of reactions) {
      await message.react(reaction.emoji);
    }

    //--- COLLECTOR ---//
    const filter = (reaction: MessageReaction, user: User | GuildMember) => {
      return user instanceof User && !user.bot;
    };

    const collector = message.createReactionCollector({
      filter,
      time: couldown,
    });

    // on reaction add
    collector.on("collect", async (reaction, user) => {
      if (!user.bot) {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        await handleOnReactions(reaction, user, multiple, message, data);
        await updatedDescription(message, data, multiple);
      }
    });

    // on reaction remove
    collector.on("remove", async (reaction, user) => {
      if (!user.bot) {
        await handleRemoveReactions(reaction, user);
        await updatedDescription(message, data, multiple);
      }
    });

    //--- TIMEOUT ---//
    setTimeout(() => {
      collector.stop();
      userChoiceMap.clear();
      message.delete();
    }, couldown);
  } catch (error) {
    console.error(error);
  }
};
