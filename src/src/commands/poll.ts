import { SlashCommand } from "../types";
import { CommandInteraction, EmbedBuilder, GuildMember, Message, MessageReaction, SlashCommandBuilder, TextChannel, User } from "discord.js";
import { calculatePollTimeLeft } from "../utils/utils";
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
}

interface PermissionData {
  message: Message;
}

const userChoiceMap = new Map<User, MessageReaction[]>();

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
      progressBar += "▓";
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
const sendEmbed = async ({ data, description, interaction }: EmbedData) => {
  const embed: EmbedBuilder = new EmbedBuilder({
    ...data.embeds[0],
    description,
  });

  const message = await interaction.reply({
    embeds: [embed],
    ephemeral: false,
    fetchReply: true,
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

export const command: SlashCommand = {
  name: "poll",
  data: new SlashCommandBuilder().setName("poll").setDescription("Créer un sondage"),

  execute: async (interaction: CommandInteraction): Promise<void> => {
    try {
      const rawData: string = fs.readFileSync("/usr/src/app/src/json/poll.json", "utf8");
      const data = JSON.parse(rawData);

      //--- DATA ---//
      let { description, choices, reactions, deadline, multiple } = data.embeds[0];
      const deadlineDate = new Date(deadline);
      const deadlineMoment = moment(deadlineDate).tz("Europe/Paris").locale("fr");
      const couldown = calculatePollTimeLeft(deadlineDate);

      description = await createDescription({ description, choices, reactions, deadlineMoment, multiple });
      const message = await sendEmbed({ data, description, interaction });
      await removeEveryonePermission({ message });

      //--- COLLECTOR ---//
      const filter = (reaction: MessageReaction, user: User | GuildMember) => {
        return user instanceof User && !user.bot;
      };

      //--- REACTIONS ---//
      for (const reaction of reactions) {
        await message.react(reaction.emoji);
      }

      const collector = message.createReactionCollector({
        filter,
        time: couldown,
      });

      // on reaction add
      collector.on("collect", async (reaction, user) => {
        if (!user.bot) {
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

      // time is up
      setTimeout(() => {
        collector.stop();
        userChoiceMap.clear();
        message.delete();
      }, couldown);
    } catch (error) {
      console.error(error);
    }
  },
};
