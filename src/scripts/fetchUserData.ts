import {fetch} from "undici";
import {StatusCodes} from "../typings/enums";
import {wiki} from "../../config.json";

interface WikiApi {
    readonly query: {
        readonly users: [
            {
                readonly missing?: boolean;
                readonly invalid?: boolean;
                readonly name: string;
                readonly registration?: null | string;
                readonly userid?: number;
                readonly blockid?: number;
                readonly blockexpiry?: string;
            }
        ],
    };
}

export default async (username: string) => {
    try {
        const response = await fetch(`https://${wiki}.fandom.com/api.php?format=json&formatversion=2&action=query&list=users&usprop=registration|blockinfo&ususers=${encodeURIComponent(username)}`);
        const data = await response.json() as WikiApi;

        const user = data.query.users[0];

        if (user.hasOwnProperty("invalid")) {
            return {code: StatusCodes.INVALID};
        }

        if (user.hasOwnProperty("missing")) {
            return {code: StatusCodes.MISSING};
        }

        if (user.hasOwnProperty("blockexpiry") && user.blockexpiry === "infinity") {
            return {code: StatusCodes.PERMANENT_BLOCK};
        }

        if (user.hasOwnProperty("blockexpiry") && user.blockexpiry !== "infinity") {
            return {code: StatusCodes.TEMPORARY_BLOCK};
        }

        return {
            id: user.userid,
            username: user.name,
            registration: user.registration,
            code: StatusCodes.SUCCESS,
        };
    } catch (e) {
        console.error(e);
        return {
            code: StatusCodes.SERVER_ERROR,
        };
    }
};
