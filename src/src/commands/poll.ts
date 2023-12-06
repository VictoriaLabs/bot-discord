import { SlashCommand } from "../types";
import { CommandInteraction, EmbedBuilder, GuildMember, Message, MessageReaction, SlashCommandBuilder, TextChannel, User } from "discord.js";
import { calculatePollTimeLeft } from "../utils/utils";
import fs from "fs";
import moment from "moment-timezone";
import "moment/locale/fr";

const userChoiceMap = new Map<User, MessageReaction[]>();

const handleOnReactions = async (reaction: MessageReaction, user: User, message: Message, multiple: boolean) => {
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

const handleRemoveReactions = async (reaction: MessageReaction, user: User, message: Message, multiple: boolean) => {
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
      let data = JSON.parse(rawData);

      let { description, choices, reactions, deadline, multiple } = data.embeds[0];

      // deadline
      const deadlineDate = new Date(deadline);
      const deadlineMoment = moment(deadlineDate).tz("Europe/Paris").locale("fr");
      const couldown = calculatePollTimeLeft(deadlineDate);

      // description
      description += "**Choices**";
      for (let i = 0; i < choices.length; i++) {
        description += `\n${reactions[i].emoji}  ${choices[i]} `;
      }
      description += "\n\n**Settings**\n";
      description += `⏰  Fin : ${deadlineMoment.format("dddd D MMMM YYYY")} à ${deadlineMoment.format("HH:mm")}\n`;
      description += `🔢  Choix : ${multiple ? "multiple" : "unique"}\n\n`;

      // create embed
      const embed: EmbedBuilder = new EmbedBuilder({
        ...data.embeds[0],
        description,
      });

      const message = await interaction.reply({
        embeds: [embed],
        ephemeral: false,
        fetchReply: true,
      });

      // add reactions
      for (const reaction of reactions) {
        await message.react(reaction.emoji);
      }

      // remove everyone's permission to add reactions
      if (message.guild && message.channel instanceof TextChannel) {
        const everyoneRole = message.guild.roles.everyone;

        message.channel.permissionOverwrites.edit(everyoneRole, {
          AddReactions: false,
        });
      }

      // filter for reactions
      const filter = (reaction: MessageReaction, user: User | GuildMember) => {
        return user instanceof User && !user.bot;
      };

      // collector for reactions
      const collector = message.createReactionCollector({
        filter,
        time: couldown,
      });

      // on reaction add
      collector.on("collect", async (reaction, user) => {
        await handleOnReactions(reaction, user, message, multiple);
      });

      // on reaction remove
      collector.on("remove", async (reaction, user) => {
        await handleRemoveReactions(reaction, user, message, multiple);
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
