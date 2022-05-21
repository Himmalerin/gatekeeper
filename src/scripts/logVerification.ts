import {Client, GuildMember, Interaction, TextChannel} from "discord.js";
import {inlineCode, time, TimestampStyles, userMention} from "@discordjs/builders";
import {channelIds, wiki} from "../../config.json";

export default async (client: Client, interaction: Interaction, moderator: GuildMember, discordAccount: GuildMember, fandomAccount) => {
    const logChannel = await interaction.guild.channels.fetch(channelIds.logging) as TextChannel;

    const discordCreatedAtTimestamp = Math.floor(discordAccount.user.createdTimestamp / 1000);
    const discordVerifiedAtTimestamp = Math.floor(Date.now().valueOf() / 1000);

    const fandomUsername = fandomAccount.username ? `[${fandomAccount.username}](https://${wiki}.fandom.com/wiki/User:${encodeURIComponent(fandomAccount.username)})` : "*Unknown*";
    const fandomCreatedAtTimestamp = fandomAccount.registration ? time((new Date(fandomAccount.registration)).valueOf() / 1000, TimestampStyles.RelativeTime) : "*Unknown*";

    const embed = {
        color: 0x198754,
        author: {
            name: `${moderator.user.tag} (${moderator.user.id})`,
            icon_url: moderator.displayAvatarURL(),
        },
        title: "Successful Verification",
        description: `
**Discord Account:**
• Username: ${userMention(discordAccount.user.id)} - ${inlineCode(discordAccount.user.tag)} (${discordAccount.user.id})
• Created: ${time(discordCreatedAtTimestamp, TimestampStyles.RelativeTime)}
• Verified: ${time(discordVerifiedAtTimestamp, TimestampStyles.RelativeTime)}

**Fandom Account:**
• Username: ${fandomUsername}
• Created: ${fandomCreatedAtTimestamp}
`,
    };

    await logChannel.send({embeds: [embed]});
}