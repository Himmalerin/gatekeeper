import {Client, FetchedThreads, GuildMember, TextChannel} from "discord.js";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {userMention} from "@discordjs/builders";
import {verification} from "../../config.json";

export default (client: Client): void => {
    client.on("guildMemberAdd", async (member: GuildMember): Promise<void> => {
        try {
            const verificationChannel = await client.channels.fetch(verification.channelId) as TextChannel;

            const verificationThreads: FetchedThreads = await verificationChannel.threads.fetchActive();

            // Don't create duplicate verification threads
            const oldVerificationThread = verificationThreads.threads.find((thread) => thread.name === `verify-${member.user.id}`);
            if (oldVerificationThread) {
                await oldVerificationThread.send({
                    content: `Welcome back to the WoF Fanon Wiki verification process, ${userMention(member.user.id)}! Click the link below to get started and then send your Fandom username in this thread.`,
                    components: [{
                        components: [{
                            type: MessageComponentTypes.BUTTON,
                            style: MessageButtonStyles.LINK,
                            label: "Link accounts",
                            url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(member.user.username)}&tag=${member.user.discriminator}`,
                        }],
                        type: MessageComponentTypes.ACTION_ROW,
                    }],
                });

                return;
            }

            const thread = await verificationChannel.threads.create({
                name: `verify-${member.user.id}`,
                autoArchiveDuration: 60,
            });

            // Automatically delete the "thread started" message
            const threadMessage = await verificationChannel.messages.fetch(thread.id);
            await threadMessage.delete();

            await thread.send({
                content: `Welcome to the WoF Fanon Wiki verification process, ${userMention(member.user.id)}! Click the button below to get started and then send your Fandom username in this thread.`,
                components: [{
                    components: [{
                        type: MessageComponentTypes.BUTTON,
                        style: MessageButtonStyles.LINK,
                        label: "Link accounts",
                        url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(member.user.username)}&tag=${member.user.discriminator}`,
                    }],
                    type: MessageComponentTypes.ACTION_ROW,
                }],
            });

        } catch (e) {
            console.error(e);
        }
    });
};
