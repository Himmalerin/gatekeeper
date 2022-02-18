import {BaseCommandInteraction, Client} from "discord.js";
import {Command} from "../interfaces/Command";

export const BotInfo: Command = {
    name: "bot-info",
    description: "Display information about the bot.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        await interaction.followUp({
            content: `${client.user.username} is an open-source bot licensed under the EUPL-1.2.
Source code: <https://github.com/Himmalerin/gatekeeper/>`,
        });
    },
};
