import {inlineCode, time} from "@discordjs/builders";
import {fetch} from "undici";
import {wiki} from "../../config.json";

interface WikiApi {
    readonly query: {
        readonly users: [
            {
                readonly missing?: boolean;
                readonly invalid?: boolean;
                readonly name: string;
                readonly userid?: number;
                readonly blockid?: number;
                readonly blockexpiry?: string;
            }
        ]
    };
}

export default async (username: string) => {
    try {
        const response = await fetch(`https://${wiki}.fandom.com/api.php?format=json&formatversion=2&action=query&list=users&usprop=blockinfo&ususers=${encodeURIComponent(username)}`);
        const data = await response.json() as WikiApi;

        const user = data.query.users[0];

        if (user.hasOwnProperty("missing") || user.hasOwnProperty("invalid")) {
            return {
                id: null,
                username: null,
                message: `The Fandom account ${inlineCode(user.name)} doesn't exist.  Please try again using a different username.`,
            };
        }

        if (user.hasOwnProperty("blocked")) {
            const blockExpiry = user.blockexpiry;

            if (blockExpiry === "infinity") {
                return {
                    id: user.userid,
                    username: user.name,
                    message: `The Fandom account ${inlineCode(user.name)} is permanently blocked.`,
                };
            }

            const blockExpiryDate = new Date(`${blockExpiry.slice(0, 4)}-${blockExpiry.slice(4, 6)}-${blockExpiry.slice(6, 8)}`);

            return {
                id: user.userid,
                username: user.name,
                message: `The Fandom account ${inlineCode(user.name)} is currently blocked.  Please try again in ${time(blockExpiryDate, "R")}.`,
            };
        }

        return {
            id: user.userid,
            username: user.name,
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
