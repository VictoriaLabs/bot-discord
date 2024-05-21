import type {KickPayloadData} from "../../types";
import Sentry from "@sentry/node";
import {discordClient} from "../../app.ts";
import type {Guild, GuildBasedChannel, GuildMember, TextChannel} from "discord.js";

/**
 * Kick a member from the server
 * @param data - The data to kick the member
 * @returns {Promise<void>}
 */
export async function kickMember(data: KickPayloadData): Promise<void> {
    try {
        // Check if the bot is on the guild
        if (discordClient.guilds.cache.get(data.guild) !== undefined) {
            const guild: Guild = discordClient.guilds.cache.get(data.guild) as Guild;
            // Check if the user to kick is on the server
            const userToKick: GuildMember = await guild.members.fetch(data.userToKick);
            if (userToKick) {
                // Kick the user
                await userToKick.kick(data.reason).then(async (): Promise<void> => {
                    let channel: GuildBasedChannel | undefined = guild.channels.cache.get(data.logsChannel);
                    if (channel?.isTextBased()) {
                        // Log the kick in the logs channel
                        const logsChannel: TextChannel = guild.channels.cache.get(data.logsChannel) as TextChannel;
                        const moderator: GuildMember = guild.members.cache.get(data.moderator) as GuildMember;
                        if (logsChannel) {
                            if (moderator) {
                                // Replace the variables in the message
                                await replaceAllInObject(data.message, userToKick, moderator, data.reason);
                                await logsChannel.send({
                                    content: !!data.message.content ? data.message.content : "",
                                    tts: false,
                                    embeds: !!data.message.embeds ? data.message.embeds : [],
                                });
                                await channel.send({
                                    content: `L'utilisateur a bien été expulsé.`,
                                    reply: {
                                        messageReference: data.replyTo,
                                    },
                                });
                            } else {
                                await channel.send({
                                    content: `L'utilisateur a bien été expulsé. Mais le modérateur n'est pas sur le serveur.`,
                                    reply: {
                                        messageReference: data.replyTo,
                                    },
                                });
                                return;
                            }
                        } else {
                            await channel.send({
                                content: `Le canal de logs n'existe pas sur le serveur. Mais l'utilisateur a bien été expulsé.`,
                                reply: {
                                    messageReference: data.replyTo,
                                },
                            });
                            return;
                        }
                    }
                });
            } else {
                // Respond to the moderator that the user isn't on the server
                const channel: TextChannel = guild.channels.cache.get(data.actualChannel) as TextChannel;
                await channel.send({
                    content: `L'utilisateur n'est pas sur le serveur.`,
                    reply: {
                        messageReference: data.replyTo,
                    },
                });
            }
        } else {
            Sentry.captureException(new Error("The bot isn't on the server !"), (scope) => {
                scope.setContext("function", {
                    name: "kickMember",
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

/**
 * Replace all the variables in the object
 * @param obj - The object to replace the variables
 * @param userToKick - The user to kick
 * @param moderator - The moderator
 * @param reason - The reason for the kick
 */
async function replaceAllInObject(obj: any, userToKick: GuildMember, moderator: GuildMember, reason: string): Promise<void> {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key]
                .replace('${member}', `${userToKick.user.username}`)
                .replace('${member.id}', `${userToKick.user.id}`)
                .replace('${moderator}', `${moderator.user.username}`)
                .replace('${moderator.id}', `${moderator.user.id}`)
                .replace('${reason}', `${reason}`);
        } else if (typeof obj[key] === 'object') {
            await replaceAllInObject(obj[key], userToKick, moderator, reason);
        }
    }
}