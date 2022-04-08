import {Client, Intents} from "discord.js";
import * as config from "../config.json";
import ready from "./events/ready";
import guildMemberAdd from "./events/guildMemberAdd";
import messageCreate from "./events/messageCreate";
import interactionCreate from "./events/interactionCreate";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

ready(client);

guildMemberAdd(client);

messageCreate(client);

interactionCreate(client);

client.login(config.token);
