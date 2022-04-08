import {Client, GuildMember, Message, TextChannel, ThreadChannel} from "discord.js";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {channelMention, inlineCode} from "@discordjs/builders";
import fetchUserData from "../scripts/fetchUserData";
import fetchDiscordName from "../scripts/fetchDiscordName";
import {StatusCodes} from "../typings/enums";
import {FandomApi} from "../typings/interfaces";
import {reactionRolesChannelId, serverRulesChannelId, verification, wiki} from "../../config.json";

export default (client: Client): void => {
    client.on("messageCreate", async (message: Message): Promise<void> => {
        if (message.author.bot === true) return;

        // Ensure that:
        //  - The message is in a public thread,
        //  - The message is in a thread inside the verification channel, and
        //  - The thread name is "verify-" followed by the user's id
        if (message.channel.type !== "GUILD_PUBLIC_THREAD") return;
        if (message.channel.parentId !== verification.channelId) return;
        if (message.channel.name !== `verify-${message.author.id}`) return;

        const channel = message.channel as ThreadChannel;
        const author: GuildMember = await message.guild.members.fetch(message.author.id);

        const userData: FandomApi = await fetchUserData(message.content);

        switch (userData.code) {
            case StatusCodes.INVALID:
                await channel.send(`Invalid username.  Please try again with a different username.`);
                return;
            case StatusCodes.MISSING:
                await channel.send(`The Fandom account ${inlineCode(message.content)} doesn't exist.  Please try again with a different username.`);
                return;
            case StatusCodes.TEMPORARY_BLOCK:
                await channel.send(`The Fandom account ${inlineCode(message.content)} is currently blocked.  Please try again later.`);
                return;
            case StatusCodes.PERMANENT_BLOCK:
                await channel.send(`The Fandom account ${inlineCode(message.content)} is permanently blocked.`);
                return;
            case StatusCodes.SERVER_ERROR:
                await channel.send(`We're having issues connecting to Fandom.  Please try verifying again later!`);
                return;
        }

        const discordData = await fetchDiscordName(userData.id, author, message.content);

        switch (discordData.code) {
            case StatusCodes.MISSING:
                await channel.send({
                    content: `The Fandom account ${inlineCode(message.content)} doesn't have a discord account linked to it.  Please link your discord account using the button below, and try again.`,
                    components: [{
                        components: [{
                            type: MessageComponentTypes.BUTTON,
                            style: MessageButtonStyles.LINK,
                            label: "Link accounts",
                            url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`,
                        }],
                        type: MessageComponentTypes.ACTION_ROW,
                    }],
                });

                return;
            case StatusCodes.SERVER_ERROR:
                await channel.send(`We're having issues connecting to Fandom.  Please try verifying again later!`);
                return;
        }

        if (discordData.username !== author.user.tag) {
            await channel.send({
                content: `The tag (${inlineCode(discordData.username)}) in the profile of the Fandom account ${inlineCode(message.content)} does not match your account's tag (${inlineCode(author.user.tag)}).  Please correct it using the button below, and try again.`,
                components: [{
                    components: [{
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.LINK,
                        label: "Link accounts",
                        url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`,
                    }],
                    type: 1,
                }],
            });

            return;
        }

        try {
            await author.setNickname(userData.username);
        } catch (e) {
            // do nothing except log it if setting the nick fails since doing that is just a nice-to-have
            console.error(e);
        }

        try {
            const verifiedRole = await message.guild.roles.fetch(verification.roleId);
            await author.roles.add(verifiedRole);
        } catch (e) {
            await channel.send(`We couldn't give you the verified role for some reason.  Please ping a moderator for assistance.`);
            return;
        }

        const verificationChannel = await channel.guild.channels.fetch(verification.channelId) as TextChannel;

        const webhooks = await verificationChannel.fetchWebhooks();
        let webhook = webhooks.find((webhook) => webhook.owner.id === client.user.id);

        if (!webhook) {
            webhook = await verificationChannel.createWebhook(client.user.username, {avatar: client.user.avatarURL({format: "png"})});
        }

        await webhook.send({
            content: `Verification of the Fandom account [${message.content}](<https://${wiki}.fandom.com/wiki/User:${encodeURIComponent(message.content)}>) was successful!

Please be sure to read the server's ${channelMention(serverRulesChannelId)}!  You can also pick up some ${channelMention(reactionRolesChannelId)}.`,
            threadId: message.channel.id,
        });

        await channel.setLocked(true);
        await channel.setArchived(true);
    });
};
