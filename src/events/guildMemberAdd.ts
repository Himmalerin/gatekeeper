import {Client, GuildMember} from "discord.js";
import setupVerificationThread from "../scripts/setupVerificationThread";

export default (client: Client): void => {
    client.on("guildMemberAdd", async (member: GuildMember): Promise<void> => await setupVerificationThread(client, member));
};
