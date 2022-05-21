import {Client, CommandInteraction, TextChannel} from "discord.js";
import {ApplicationCommandTypes, MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {Command} from "../typings/interfaces";
import {channelIds, roleIds} from "../../config.json";

export const VerificationInstructions: Command = {
    name: "verification-instructions",
    description: "Send a message to allow users to verify themselves.",
    type: ApplicationCommandTypes.CHAT_INPUT,
    run: async (client: Client, interaction: CommandInteraction) => {
        const guildMember = await interaction.guild.members.fetch(interaction.user.id);
        if (!guildMember.roles.cache.has(roleIds.moderator)) {
            await interaction.followUp("You do not have permission to use this command.");

            return;
        }

        const verificationChannel = await client.channels.fetch(channelIds.verification) as TextChannel;

        await verificationChannel.send({
            content: `Welcome to the Wings of Fire Fanon Discord!  In order to gain access to the rest of the server, please verify your account.

**To verify:**
• Sign into your Fandom account and then press the "Link accounts" button below
• Follow the instructions on the page you're taken to
• Press the "Verify your account" button below and enter your Fandom username in the popup window`,
            components: [{
                components: [
                    {
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.SUCCESS,
                        customId: "verification",
                        label: "Verify your account",
                    },
                    {
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.LINK,
                        label: "Link accounts",
                        url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+`,
                    },
                    {
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.SECONDARY,
                        customId: "help",
                        label: "Need help?",
                    },
                ],
                type: 1,
            }],
        });

        await interaction.followUp({
            content: "Sending the verification greeting!",
            ephemeral: true,
        });
    },
};
