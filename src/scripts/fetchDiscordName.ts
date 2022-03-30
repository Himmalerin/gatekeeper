import {GuildMember} from "discord.js";
import {inlineCode} from "@discordjs/builders";
import {fetch} from "undici";

interface ServiceApi {
    readonly name: string;
    readonly value: string;
    readonly status?: number;
}

export default async (userId: number, author: GuildMember, fandomUsername: string) => {
    try {
        const response = await fetch(`/user-attribute/user/${userId}/attr/discordHandle`);
        const data = await response.json() as ServiceApi;

        if (data.status === 404) {
            return {
                id: userId,
                username: null,
                message: `There is no Discord tag associated with the Fandom account ${inlineCode(fandomUsername)}.  Please add ${inlineCode(author.user.username)} to your Fandom profile using the link below.
https://community.fandom.com/wiki/Special:VerifyUser?c=+&user=${encodeURIComponent(author.user.username)}&tag=${author.user.discriminator}`,
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
