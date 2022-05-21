import {Client, CommandInteraction, ModalSubmitInteraction} from "discord.js";
import {StatusCodes} from "../typings/enums";
import {FandomApi} from "../typings/interfaces";
import fetchUserData from "./fetchUserData";
import {channelMention, inlineCode} from "@discordjs/builders";
import fetchDiscordName from "./fetchDiscordName";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {channelIds, roleIds} from "../../config.json";
import logVerification from "./logVerification";

export default async (client: Client, interaction: ModalSubmitInteraction | CommandInteraction, discordAccount, fandomUsername) => {
    const fandomAccount: FandomApi = await fetchUserData(fandomUsername);

    switch (fandomAccount.code) {
        case StatusCodes.INVALID:
            await interaction.reply({
                content: `Invalid username.  Please try again with a different username.  (Error code: ${inlineCode(fandomAccount.code.toString())}})`,
                ephemeral: true,
            });
            return;
        case StatusCodes.MISSING:
            await interaction.reply({
                content: `The Fandom account ${inlineCode(fandomUsername)} doesn't exist.  Please try again with a different username.  (Error code: ${inlineCode(fandomAccount.code.toString())}})`,
                ephemeral: true,
            });
            return;
        case StatusCodes.TEMPORARY_BLOCK:
            await interaction.reply({
                content: `The Fandom account ${inlineCode(fandomUsername)} is currently blocked.  Please try again later.  (Error code: ${inlineCode(fandomAccount.code.toString())}})`,
                ephemeral: true,
            });
            return;
        case StatusCodes.PERMANENT_BLOCK:
            await interaction.reply({
                content: `The Fandom account ${inlineCode(fandomUsername)} is permanently blocked.  (Error code: ${inlineCode(fandomAccount.code.toString())}})`,
                ephemeral: true,
            });
            return;
        case StatusCodes.SERVER_ERROR:
            await interaction.reply({
                content: `We're having issues connecting to Fandom.  Please try verifying again later!  (Error code: ${inlineCode(fandomAccount.code.toString())})`,
                ephemeral: true,
            });
            return;
    }

    const discordData = await fetchDiscordName(fandomAccount.id);

    switch (discordData.code) {
        case StatusCodes.MISSING:
            await interaction.reply({
                content: `The Fandom account ${inlineCode(fandomUsername)} doesn't have a discord account linked to it.  Please link your discord account using the button below, and try again.`,
                components: [{
                    components: [{
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.LINK,
                        label: "Link accounts",
                        url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(discordAccount.user.username)}&tag=${discordAccount.user.discriminator}`,
                    }],
                    type: MessageComponentTypes.ACTION_ROW,
                }],
                ephemeral: true,
            });

            return;
        case StatusCodes.SERVER_ERROR:
            await interaction.reply({
                content: `We're having issues connecting to Fandom.  Please try verifying again later!`,
                ephemeral: true,
            });
            return;
    }

    if (discordData.username !== discordAccount.user.tag) {
        await interaction.reply({
            content: `The tag (${inlineCode(discordData.username)}) in the profile of the Fandom account ${inlineCode(fandomUsername)} does not match your account's tag (${inlineCode(discordAccount.user.tag)}).  Please correct it using the button below, and try again.`,
            components: [{
                components: [{
                    type: MessageComponentTypes.BUTTON,
                    style: MessageButtonStyles.LINK,
                    label: "Link accounts",
                    url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(discordAccount.user.username)}&tag=${discordAccount.user.discriminator}`,
                }],
                type: 1,
            }],
            ephemeral: true,
        });

        return;
    }

    try {
        const moderator = await interaction.guild.members.fetch(client.user.id);

        await logVerification(client, interaction, moderator, discordAccount, fandomAccount);

        await discordAccount.setNickname(fandomAccount.username);

        const verifiedRole = await interaction.guild.roles.fetch(roleIds.verified);
        await discordAccount.roles.add(verifiedRole);

        // Don't send the message if a server mod is doing the verification
        if (moderator.user.id !== client.user.id) {
            await interaction.reply({
                content: `Verification complete!  Please be sure to read the server's ${channelMention(channelIds.rules)}!  You can also pick up some ${channelMention(channelIds.roles)}.`,
                ephemeral: true,
            });
        }
    } catch (e) {
        await interaction.followUp({
            content: `We couldn't verify you for some reason.  Please ping a moderator for assistance.`,
            ephemeral: true,
        });

        console.error(e);
    }
}