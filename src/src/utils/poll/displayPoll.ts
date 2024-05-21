import {EmbedBuilder, Message, TextChannel} from "discord.js";

//--- INITIALIZE DESCRIPTION ---//
export function initializeDescription(data: any): string {
  let description: string = "";

  description += "**Choix**";
  for (let i = 0; i < data.choices.length; i++) {
    description += `\n${data.reactions[i].emoji}  ${data.choices[i]} `;
  }

  description += "\n\n**Résultats\n**";
  for (let i = 0; i < data.choices.length; i++) {
    let progressBar: string = "";
    for (let j = 0; j < 10; j++) {
      progressBar += "░";
    }

    description += `${data.reactions[i].emoji}  ${progressBar}  [0  •  0%]\n`;
  }

  description += `Total votes : 0`;

  description += "\n\n**Infos**\n";
  description += `⏰  Fin : ${data.deadline.format("dddd D MMMM YYYY")} à ${data.deadline.format("HH:mm")}\n`;
  description += `🔢  Choix : ${data.multiple ? "multiple" : "unique"}\n\n  `;

  return description;
}

//--- CREATE EMBED ---//
export async function createPollEmbed(data: any): Promise<EmbedBuilder> {
  const description: string = initializeDescription(data);

  return new EmbedBuilder({
    title: data.title,
    description: description,
    color: data.color,
    footer: data.footer,
    timestamp: data.timestamp,
  });
}

//--- SEND EMBED ---//
export async function sendPollEmbed(embed: EmbedBuilder, channel: TextChannel): Promise<Message> {
  return await channel.send({
    embeds: [embed],
  });
}

//--- ADD REACTIONS ---//
export async function addReactions(message: Message, reactions: any): Promise<void> {
  for (const reaction of reactions) {
    await message.react(reaction.emoji);
  }
}
