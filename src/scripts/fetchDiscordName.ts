import {fetch} from "undici";
import {StatusCodes} from "../typings/enums";

interface ServiceApi {
    readonly name: string;
    readonly value: string;
    readonly status?: number;
}

export default async (userId: number) => {
    try {
        const response = await fetch(`https://services.fandom.com/user-attribute/user/${userId}/attr/discordHandle`);
        const data = await response.json() as ServiceApi;

        if (data.status === 404 || data.value === "") {
            return {code: StatusCodes.MISSING};
        }

        return {
            id: userId,
            username: data.value,
            code: StatusCodes.SUCCESS,
        };
    } catch (error) {
        console.error(error);
        return {code: StatusCodes.SERVER_ERROR};
    }
};
