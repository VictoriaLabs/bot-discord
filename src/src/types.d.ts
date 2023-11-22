import {Collection, CommandInteraction, SlashCommandBuilder} from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_CLIENT_ID: string;
            DISCORD_TOKEN: string;
        }
    }
}

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, SlashCommand>;
    }
}

export interface BotEvent {
    name: string;
    once?: boolean | false;
    execute: (...args: any[]) => void;
}

export interface SlashCommand {
    name: string;
    data: SlashCommandBuilder | any;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
}

export {};