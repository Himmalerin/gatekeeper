import {BaseCommandInteraction, Client, TextChannel} from "discord.js";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {Command} from "../typings/interfaces";
import {channelIds, roleIds} from "../../config.json";

export const VerificationGreeting: Command = {
    name: "verification-greeting",
    description: "Send a message to allow users to verify themselves.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (member.roles.cache.has(roleIds.moderator) === false) {
            await interaction.followUp({
                content: "You do not have permission to use this command.",
            });

            return;
        }

        const verificationChannel = await client.channels.fetch(channelIds.verification) as TextChannel;

        await verificationChannel.send({
            content: `Welcome to the Wings of Fire Fanon Discord!  In order to verify and gain access to the rest of the server please follow the instructions in your dedicated verification thread.

If your verification thread closes you can press the button below to create a new one.`,
            components: [{
                components: [{
                    type: MessageComponentTypes.BUTTON,
                    style: MessageButtonStyles.PRIMARY,
                    customId: "verification",
                    label: "Restart verification process",
                }],
                type: 1,
            }],
        });

        await interaction.followUp({
            ephemeral: true,
            content: "Sending the verification greeting!",
        });
    },
};
