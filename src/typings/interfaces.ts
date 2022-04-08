import {BaseCommandInteraction, ChatInputApplicationCommandData, Client} from "discord.js";
import {StatusCodes} from "./enums";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export interface FandomApi {
    code: StatusCodes;
    id?: number;
    username?: string;
    blockLength?: number;
}
