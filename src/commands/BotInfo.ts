import {BaseCommandInteraction, Client} from "discord.js";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {Command} from "../typings/interfaces";

export const BotInfo: Command = {
    name: "bot-info",
    description: "Display information about the bot.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        await interaction.followUp({
            content: `${client.user.username} is an open-source bot licensed under the EUPL-1.2.`,
            components: [{
                components: [{
                    type: MessageComponentTypes.BUTTON,
                    style: MessageButtonStyles.LINK,
                    label: "Source code",
                    url: `https://github.com/himmalerin/gatekeeper`,
                }],
                type: MessageComponentTypes.ACTION_ROW,
            }],
        });
    },
};
