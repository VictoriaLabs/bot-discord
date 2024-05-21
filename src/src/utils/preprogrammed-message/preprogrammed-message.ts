import type {PreProgrammedPayloadData} from "../../types";
import {discordClient, webSocket} from "../../app.ts";
import type {Guild, GuildBasedChannel} from "discord.js";
import Sentry from "@sentry/node";

/**
 * Send a pre-programmed message to a specific channel on a specific guild
 * @param data - The data to send the message
 * @returns {Promise<void>}
 */
export async function sendPreProgrammedMessage(data: PreProgrammedPayloadData): Promise<void> {
    try {
        // Check if the bot is on the guild
        if (discordClient.guilds.cache.get(data.guild) !== undefined) {
            const guild: Guild = discordClient.guilds.cache.get(data.guild) as Guild;
            // Check if the channel exists on the guild
            if (guild.channels.cache.get(data.channel)) {
                let channel: GuildBasedChannel | undefined = guild.channels.cache.get(data.channel);
                // Check if the channel is a text channel
                if (channel?.isTextBased()) {
                    await channel.send({
                        content: !!data.message?.content ? data.message?.content : "",
                        tts: !!data.message?.tts ? data.message?.tts : false,
                        embeds: !!data.message?.embeds ? data.message?.embeds : []
                    }).then((): void => {
                        webSocket.emit('response', {
                            type: 'pre-programmed-message',
                            payload: {
                                process: {
                                    id: data.process.id,
                                    status: 'success'
                                }
                            }
                        });
                    })
                }
            } else {
                Sentry.captureException(new Error("The chanel doesn't exist in the server !"), (scope) => {
                    scope.setContext("function", {
                        name: "sendPreProgrammedMessage",
                        discord_Server_Id: `${data.guild}`,
                        discord_Channel_Id: `${data.channel}`,
                    });
                    return scope;
                });
                console.error(`Le channel n'existe pas sur le serveur avec l'id: ${data.guild}`);
                return;
            }
        } else {
            Sentry.captureException(new Error("The bot isn't on the server !"), (scope) => {
                scope.setContext("function", {
                    name: "sendPreProgrammedMessage",
                    discord_Server_Id: `${data.guild}`,
                });
                return scope;
            });
            return;
        }
    } catch (error) {
        Sentry.captureException(error, (scope) => {
            scope.setContext("function", {
                name: "sendPreProgrammedMessage",
            });
            return scope;
        });
        console.error(error);
    }
}