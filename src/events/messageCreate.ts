import {Client, GuildMember, Message, MessageActionRow, MessageButton, ThreadChannel} from "discord.js";
import {channelMention, inlineCode} from "@discordjs/builders";
import fetchUserData from "../scripts/fetchUserData";
import fetchDiscordName from "../scripts/fetchDiscordName";
import {FandomApi} from "../interfaces/FandomApi";
import {reactionRolesChannelId, serverRulesChannelId, verification} from "../../config.json";

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
        if (userData.message) {
            await channel.send(userData.message);
            return;
        }

        const discordData = await fetchDiscordName(userData.id, author, message.content);
        if (discordData.message) {
            await channel.send(discordData.message);
            return;
        }

        if (discordData.username === "") {
            const button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Verify your account")
                        .setStyle("LINK")
                        .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`),
                );

            await channel.send({
                content: `The Fandom account ${inlineCode(message.content)} doesn't have a discord account associated with it. Please add your discord account using the button below, and try again.`,
                components: [button],
            });
            return;
        }

        if (discordData.username !== author.user.tag) {
            const button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Verify your account")
                        .setStyle("LINK")
                        .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`),
                );

            await channel.send({
                content: `The tag (${inlineCode(discordData.username)}) in the profile of the Fandom account ${inlineCode(message.content)} does not match your account's tag (${inlineCode(author.user.tag)}). Please correct it using the button below, and try again.`,
                components: [button],
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
            await channel.send(`Giving you the verified role failed for some reason.  Please ping a server moderator!`);
            return;
        }

        await channel.send(`Verification of the Fandom account ${inlineCode(message.content)} was successful!

Please be sure to read the server's ${channelMention(serverRulesChannelId)}!  You can also pick up some ${channelMention(reactionRolesChannelId)}.`);

        await channel.setLocked(true);
        await channel.setArchived(true);
    });
};