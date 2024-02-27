import type {CommandInteraction} from "discord.js";

export async function sendErrorMessage(hasAlreadyReplied: boolean, interaction: CommandInteraction): Promise<void> {
    if (hasAlreadyReplied) {
        await interaction.followUp({
            embeds: [
                {
                    title: "❌ Oops, une erreur s'est produite ! ❌",
                    description: "📝 Faire une réclamation à l'équipe de développement du bot [ici](https://doc.victorialabs.site/)",
                    color: 16711680,
                    footer: {
                        text: "Victoria Labs - 2024"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        });
    } else {
        await interaction.reply({
            embeds: [
                {
                    title: "❌ Oops, une erreur s'est produite ! ❌",
                    description: "📝 Faire une réclamation à l'équipe de développement du bot [ici](https://doc.victorialabs.site/)",
                    color: 16711680,
                    footer: {
                        text: "Victoria Labs - 2024"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        });
    }
}