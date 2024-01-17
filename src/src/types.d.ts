import {Collection, CommandInteraction, SlashCommandBuilder, Snowflake} from "discord.js";

declare module "bun" {

    interface Env {
        TOKEN: string;
        CLIENT_ID: string | Snowflake;
    }
}

declare module "discord.js" {
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

export {};