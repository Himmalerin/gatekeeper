import {Command} from "./typings/interfaces";
import {VerificationGreeting} from "./commands/VerificationGreeting";
import {BotInfo} from "./commands/BotInfo";

export const Commands: Command[] = [VerificationGreeting, BotInfo];
