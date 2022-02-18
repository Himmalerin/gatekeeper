import {Command} from "./interfaces/Command";
import {VerificationGreeting} from "./commands/VerificationGreeting";
import {BotInfo} from "./commands/BotInfo";

export const Commands: Command[] = [VerificationGreeting, BotInfo];
