import {GuildMember, MessageActionRow, MessageButton} from "discord.js";
import {inlineCode} from "@discordjs/builders";
import {fetch} from "undici";

interface ServiceApi {
    readonly name: string;
    readonly value: string;
    readonly status?: number;
}

export default async (userId: number, author: GuildMember, fandomUsername: string) => {
    try {
        const response = await fetch(`https://services.fandom.com/user-attribute/user/${userId}/attr/discordHandle`);
        const data = await response.json() as ServiceApi;

        if (data.status === 404 || data.value === "") {
            const button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Verify your account")
                        .setStyle("LINK")
                        .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`),
                );

            return {
                id: userId,
                username: null,
                message: {
                    content: `The Fandom account ${inlineCode(fandomUsername)} doesn't have a discord account associated with it. Please add your discord account using the button below, and try again.`,
                    components: [button],
                },
            };
        }

        return {
            id: userId,
            username: data.value,
            message: null,
        };
    } catch (error) {
        console.error(error);
        return {
            id: null,
            username: null,
            message: "We're having issues connecting to Fandom.  Please try verifying again later!",
        };
    }
};
