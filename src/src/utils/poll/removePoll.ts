import { Message } from "discord.js";
import { type Moment } from "moment-timezone";
import { timeLeft } from "../others/timeLeft.ts";
import "moment/locale/fr";

export async function removeMessageAfterDeadline(message: Message, deadline: Moment) {
  const deadlineTime = deadline.toDate();
  const time = timeLeft(deadlineTime);

  setTimeout(async () => {
    if (message.deletable) {
      await message.delete();
    }
  }, time);
}
