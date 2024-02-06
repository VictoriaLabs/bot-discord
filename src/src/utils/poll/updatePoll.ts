import { EmbedBuilder, Message } from "discord.js";

export async function updateDescription(message: Message, data: any) {
  let description = "**Choix**";

  for (let i = 0; i < data.choices.length; i++) {
    description += `\n${data.reactions[i].emoji}  ${data.choices[i]} `;
  }

  description += "\n\n**Résultats\n**";

  const totalReactions = message.reactions.cache.reduce((total, reaction) => total + (reaction.count - 1), 0);

  for (let i = 0; i < data.choices.length; i++) {
    // Get the reaction for the current choice
    const reaction = message.reactions.cache.get(data.reactions[i].emoji);
    // Get the count of the reaction
    const count = reaction ? reaction.count - 1 : 0; // Subtract 1 because the bot's own reaction is also counted
    // Calculate the percentage of the total reactions this reaction represents
    const percentage = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0;

    let progressBar = "";
    for (let j = 0; j < percentage / 10; j++) {
      progressBar += "█";
    }
    for (let j = 0; j < 10 - percentage / 10; j++) {
      progressBar += "░";
    }

    description += `${data.reactions[i].emoji}  ${progressBar}  [${count}  •  ${percentage}%]\n`;
  }
  description += `Total votes : ${totalReactions}`;
  description += "\n\n**Infos**\n";
  description += `⏰  Fin : ${data.deadline.format("dddd D MMMM YYYY")} à ${data.deadline.format("HH:mm")}\n`;
  description += `🔢  Choix : ${data.multiple ? "multiple" : "unique"}\n\n  `;

  const newEmbed = new EmbedBuilder({
    title: data.title,
    description,
    color: data.color,
    footer: data.footer,
    timestamp: data.timestamp,
  });

  message.edit({
    embeds: [newEmbed],
  });
}
