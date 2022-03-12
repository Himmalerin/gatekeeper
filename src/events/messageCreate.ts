import {Client, GuildMember, Message, MessageActionRow, MessageButton, ThreadChannel} from "discord.js";

import {verification} from "../../config.json";
import {FandomApi} from "../interfaces/FandomApi";
import fetchUserData from "../scripts/fetchUserData";
import fetchDiscordName from "../scripts/fetchDiscordName";
import {inlineCode} from "@discordjs/builders";

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
            await message.channel.send(userData.message);
            return;
        }

        const discordData = await fetchDiscordName(userData.id, author, message.content);
        if (discordData.message) {
            await message.channel.send(discordData.message);
            return;
        }

        if (discordData.username !== author.user.tag) {
            const button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Verify your account")
                        .setStyle("LINK")
                        .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`),
                );

            await message.channel.send({
                content: `The tag (${inlineCode(discordData.username)}) in the profile of the Fandom account ${inlineCode(message.content)} does not match your account's tag (${inlineCode(author.user.tag)}). Please correct it using the button below, and try again.`,
                components: [button],
            });
            return;
        }

        const verifiedRole = await message.guild.roles.fetch(verification.roleId);
        await author.roles.add(verifiedRole);

        await author.setNickname(userData.username);

        await message.channel.send(`Verification of your Discord account with Fandom account ${inlineCode(message.content)} was successful!`);

        await channel.setLocked(true);
        await channel.setArchived(true);
    });
};