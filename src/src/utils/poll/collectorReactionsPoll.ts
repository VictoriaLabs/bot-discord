import { User, type Message, type MessageReaction } from "discord.js";
import { timeLeft } from "../timeLeft";
import { updateDescription } from "./updatePoll";

//--- COLLECTOR REACTION ---//
export async function collectorReaction(message: Message, allData: any, userChoiceMap: Map<User, MessageReaction[]>) {
  const deadlineTime = allData.deadline.toDate();
  const time = timeLeft(deadlineTime);

  const filter = (reaction: MessageReaction, user: User) => {
    return user instanceof User && !user.bot;
  };

  const collector = message.createReactionCollector({ filter, time: time, dispose: true });

  collector.on("collect", async (reaction, user) => {
    console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
    await handleOnReactions(reaction, user, userChoiceMap, allData);
    await updateDescription(message, allData);
  });

  collector.on("remove", async (reaction, user) => {
    console.log(`Removed ${reaction.emoji.name} from ${user.tag}`);
    await handleRemoveReactions(reaction, user, userChoiceMap, allData);
    await updateDescription(message, allData);
  });
}

//--- HANDLE ON REACTIONS ---//
export async function handleOnReactions(reaction: MessageReaction, user: User, userChoiceMap: Map<User, MessageReaction[]>, allData: any) {
  const userReactions = userChoiceMap.get(user);
  const { multiple, reactions } = allData;

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
}

//--- HANDLE REMOVE REACTIONS ---//
export async function handleRemoveReactions(reaction: MessageReaction, user: User, userChoiceMap: Map<User, MessageReaction[]>, allData: any) {
  const userReactions = userChoiceMap.get(user);

  if (userReactions) {
    const index = userReactions.indexOf(reaction);
    if (index !== -1) {
      userReactions.splice(index, 1);
    }
  }
}
