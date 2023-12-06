import {Client, EmbedBuilder, TextChannel} from "discord.js";

interface programmedMessageArg {
    channel?: string;
    content?: string | undefined;
    tts?: boolean;
    embeds?: EmbedBuilder[];
}

export function sendProgrammedMessage(arg: programmedMessageArg, discordClient: Client): void {
    const channel: TextChannel = discordClient.channels.cache.get('1174276744874836028') as TextChannel;
    channel.send({
        content: arg.content,
        tts: arg.tts,
        embeds: arg.embeds
    });
}