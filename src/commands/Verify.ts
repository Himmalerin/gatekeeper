import {Client, CommandInteraction} from "discord.js";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {Command} from "../typings/interfaces";
import verifyAccount from "../scripts/verifyAccount";
import {roleIds} from "../../config.json";
import logVerification from "../scripts/logVerification";

export const Verify: Command = {
    name: "verify-user",
    description: "Manually verify a Discord user.",
    options: [
        {
            type: ApplicationCommandOptionTypes.USER,
            name: "target",
            description: "Discord user who should be manually verified",
            required: true,
        },
        {
            type: ApplicationCommandOptionTypes.STRING,
            name: "fandom-username",
            description: "Username of the Fandom account belonging to the target",
            required: false,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const guildMember = await interaction.guild.members.fetch(interaction.member.user.id);
        if (!guildMember.roles.cache.has(roleIds.moderator)) {
            await interaction.followUp("You do not have permission to use this command.");
            return;
        }

        const target = interaction.options.getUser("target");
        const fandomUsername = interaction.options.getString("fandom-username");

        const discordAccount = interaction.guild.members.cache.get(target.id);

        try {
            if (fandomUsername) {
                await verifyAccount(client, interaction, discordAccount, fandomUsername);
                await discordAccount.setNickname(fandomUsername);

                await interaction.followUp(`Successfully verified ${discordAccount.user.tag} as ${fandomUsername}.`);

                return;
            }

            const verifiedRole = await interaction.guild.roles.fetch(roleIds.verified);

            await discordAccount.roles.add(verifiedRole);

            await logVerification(client, interaction, guildMember, discordAccount, {
                username: undefined,
                registration: undefined,
            });

            await interaction.followUp(`Successfully verified ${discordAccount.user.tag}.`);
        } catch (e) {
            await interaction.reply({
                content: "We couldn't verify that user for some reason.",
                ephemeral: true,
            });

            console.error(e);
        }
    },
};
