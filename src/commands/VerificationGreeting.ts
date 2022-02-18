import {BaseCommandInteraction, Client, MessageActionRow, MessageButton, TextChannel} from "discord.js";
import {Command} from "../interfaces/Command";

import {moderatorRoleId, verification} from "../../config.json";

export const VerificationGreeting: Command = {
    name: "verification-greeting",
    description: "Send a message to allow users to verify themselves.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (member.roles.cache.has(moderatorRoleId) === false) {
            await interaction.followUp({
                content: "You do not have permission to use this command.",
            });

            return;
        }

        const verificationChannel = await client.channels.fetch(verification.channelId) as TextChannel;

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("verification")
                    .setLabel("Verify your account")
                    .setStyle("PRIMARY"),
            );

        await verificationChannel.send({
            content: "Welcome to the Wings of Fire Fanon Discord!  In order to verify and gain access to the rest of the server please follow the instructions in your dedicated verification thread.",
            components: [row],
        });

        await interaction.followUp({
            ephemeral: true,
            content: "Sending the verification greeting!",
        });
    },
};
