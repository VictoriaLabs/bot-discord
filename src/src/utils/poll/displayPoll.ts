import { EmbedBuilder, TextChannel, Message } from "discord.js";

//--- INITIALIZE DESCRIPTION ---//
export function initializeDescription(data: any) {
  let description = "";

  description += "**Choix**";
  for (let i = 0; i < data.choices.length; i++) {
    description += `\n${data.reactions[i].emoji}  ${data.choices[i]} `;
  }

  description += "\n\n**Résultats\n**";
  for (let i = 0; i < data.choices.length; i++) {
    let progressBar = "";
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
export async function createPollEmbeb(data: any): Promise<EmbedBuilder> {
  const description = initializeDescription(data);

  const embed = new EmbedBuilder({
    title: data.title,
    description: description,
    color: data.color,
    footer: data.footer,
    timestamp: data.timestamp,
  });

  return embed;
}

//--- SEND EMBED ---//
export async function sendPollEmbed(embed: EmbedBuilder, channel: TextChannel): Promise<Message> {
  const message = await channel.send({
    embeds: [embed],
  });

  return message;
}

//--- ADD REACTIONS ---//
export async function addReactions(message: Message, reactions: any) {
  for (const reaction of reactions) {
    await message.react(reaction.emoji);
  }
}
