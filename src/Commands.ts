import {Command} from "./typings/interfaces";
import {BotInfo} from "./commands/BotInfo";
import {VerificationInstructions} from "./commands/VerificationInstructions";
import {Verify} from "./commands/Verify";


export const Commands: Command[] = [
    BotInfo,
    VerificationInstructions,
    Verify,
];
