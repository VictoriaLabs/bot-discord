import {User, type Message, type MessageReaction, ReactionCollector} from "discord.js";
import { timeLeft } from "../others/timeLeft.ts";
import { updateDescription } from "./updatePoll";

//--- COLLECTOR REACTION ---//
export async function collectorReaction(message: Message, allData: any, userChoiceMap: Map<User, MessageReaction[]>): Promise<void> {
  const deadlineTime = allData.deadline.toDate();
  const time: number = timeLeft(deadlineTime);

  const filter = (reaction: MessageReaction, user: User) => {
    return !user.bot;
  };

  const collector: ReactionCollector = message.createReactionCollector({ filter, time: time, dispose: true });

  collector.on("collect", async (reaction: MessageReaction, user: User): Promise<void> => {
    await handleOnReactions(reaction, user, userChoiceMap, allData);
    await updateDescription(message, allData);
  });

  collector.on("remove", async (reaction: MessageReaction, user: User): Promise<void> => {
    await handleRemoveReactions(reaction, user, userChoiceMap, allData);
    await updateDescription(message, allData);
  });
}

//--- HANDLE ON REACTIONS ---//
export async function handleOnReactions(reaction: MessageReaction, user: User, userChoiceMap: Map<User, MessageReaction[]>, allData: any): Promise<void> {
  const userReactions: MessageReaction[] | undefined = userChoiceMap.get(user);
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
  const userReactions: MessageReaction[] | undefined = userChoiceMap.get(user);

  if (userReactions) {
    const index: number = userReactions.indexOf(reaction);
    if (index !== -1) {
      userReactions.splice(index, 1);
    }
  }
}
