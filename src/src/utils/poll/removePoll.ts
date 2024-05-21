import { Message } from "discord.js";
import { type Moment } from "moment-timezone";
import { timeLeft } from "../others/timeLeft.ts";
import "moment/locale/fr";

export async function removeMessageAfterDeadline(message: Message, deadline: Moment): Promise<void> {
  const deadlineTime: Date = deadline.toDate();
  const time: number = timeLeft(deadlineTime);

  setTimeout(async (): Promise<void> => {
    if (message.deletable) {
      await message.delete();
    }
  }, time);
}
