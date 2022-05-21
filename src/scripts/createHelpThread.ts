import {ButtonInteraction, Client, FetchedThreads, TextChannel} from "discord.js";
import {channelMention, inlineCode, roleMention, userMention} from "@discordjs/builders";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {channelIds, roleIds} from "../../config.json";
import {StatusCodes} from "../typings/enums";

export default async (client: Client, interaction: ButtonInteraction) => {
    const guildMember = interaction.guild.members.cache.get(interaction.user.id);

    try {
        const verificationChannel = await client.channels.fetch(channelIds.verification) as TextChannel;

        const verificationThreads: FetchedThreads = await verificationChannel.threads.fetchActive();

        // Don't create duplicate help threads
        const oldVerificationThread = verificationThreads.threads.find((thread) => thread.name === `verify-${guildMember.user.id}`);
        if (oldVerificationThread) {
            await interaction.reply({
                content: `You already have an active help thread at ${channelMention(oldVerificationThread.id)}.`,
                ephemeral: true,
            });

            return;
        }

        const thread = await verificationChannel.threads.create({
            name: `verify-${guildMember.user.id}`,
            autoArchiveDuration: 60,
        });

        // Automatically delete the "thread started" message
        const threadMessage = await verificationChannel.messages.fetch(thread.id);
        await threadMessage.delete();

        await thread.send({
            content: `Hello, ${userMention(guildMember.user.id)}!  Please outline the issues you're encountering when attempting to verify in this thread.  If a moderator isn't with you shortly please ping the ${roleMention(roleIds.moderator)} role.

Before you ping the server moderators here are some things to double check:
• **Error codes ${inlineCode(StatusCodes.INVALID.toString())} or ${inlineCode(StatusCodes.MISSING.toString())}:** That Fandom account doesn't exist or you're misspelling the username.  Correct the spelling and try again.
• **Error code ${inlineCode(StatusCodes.TEMPORARY_BLOCK.toString())}:** Your Fandom account is temporarily blocked.  You may create a block appeal on a moderator's message wall.
• **Error code ${inlineCode(StatusCodes.PERMANENT_BLOCK.toString())}:** Your Fandom account is permanently blocked.
• **Error code ${inlineCode(StatusCodes.SERVER_ERROR.toString())}:** We're having trouble connecting to Fandom's servers.  You may wait and try verifying again later or ping a server moderator to be manually verified.

You should also make sure your accounts are properly linked together.  You can do so by signing into your Fandom account and then pressing the "Link accounts" button below.`,
            components: [{
                components: [{
                    type: MessageComponentTypes.BUTTON,
                    style: MessageButtonStyles.LINK,
                    label: "Link accounts",
                    url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(guildMember.user.username)}&tag=${guildMember.user.discriminator}`,
                }],
                type: MessageComponentTypes.ACTION_ROW,
            }],
            allowedMentions: {parse: ["users"]},
        });

    } catch (e) {
        console.error(e);
    }
};