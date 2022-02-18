import {GuildMember} from "discord.js";
import * as undici from "undici";

interface ServiceApi {
    readonly name: string;
    readonly value: string;
    readonly status?: number;
}

export default async (userId: number, author: GuildMember, fandomUsername: string) => {
    const client = new undici.Client(`https://services.fandom.com`);

    try {
        const {body} = await client.request({
            path: `/user-attribute/user/${userId}/attr/discordHandle`,
            method: "GET",
        });
        body.setEncoding("utf8");
        const data: ServiceApi = await body.json();

        if (data.status === 404) {
            return {
                id: userId,
                username: null,
                message: `There is no Discord tag associated with the Fandom account \`${fandomUsername}\`.  Please add \`${author.user.username}\` to your Fandom profile using the link below.
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
