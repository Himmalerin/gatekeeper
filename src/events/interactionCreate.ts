import {
    BaseCommandInteraction,
    ButtonInteraction,
    Client,
    FetchedThreads,
    GuildMember,
    Interaction,
    MessageActionRow,
    MessageButton,
    TextChannel,
} from "discord.js";
import {channelMention, userMention} from "@discordjs/builders";
import {Commands} from "../Commands";
import {verification} from "../../config.json";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction);
        }

        if (interaction.isButton()) {
            await handleButton(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.followUp({content: "An error has occurred"});
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};

const handleButton = async (client: Client, interaction: ButtonInteraction): Promise<void> => {
    const member: GuildMember = await interaction.guild.members.fetch(interaction.user.id);

    if (member.roles.cache.has(verification.roleId)) {
        await interaction.reply({
            ephemeral: true,
            content: `You are already verified.`,
        });

        return;
    }

    const verificationChannel = await client.channels.fetch(verification.channelId) as TextChannel;

    const verificationThreads: FetchedThreads = await verificationChannel.threads.fetchActive();

    const previousVerificationThread = verificationThreads.threads.find((thread) => thread.name === `verify-${member.user.id}`);

    if (previousVerificationThread === undefined) {
        const thread = await verificationChannel.threads.create({
            name: `verify-${member.user.id}`,
            autoArchiveDuration: 60,
        });

        // Automatically delete the "thread started" message
        const threadMessage = await verificationChannel.messages.fetch(thread.id);
        await threadMessage.delete();

        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel("Verify your account")
                    .setStyle("LINK")
                    .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?c=+&user=${encodeURIComponent(member.user.username)}&tag=${member.user.discriminator}`),
            );

        await thread.send({
            content: `Welcome to the WoF Fanon Wiki verification process, ${userMention(member.user.id)}! Click the link below to get started and then send your Fandom username in this thread.`,
            components: [button],
        });

        await interaction.reply({
            ephemeral: true,
            content: `Please head over to ${channelMention(thread.id)} to verify!`,
        });
    } else {
        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel("Verify your account")
                    .setStyle("LINK")
                    .setURL(`https://community.fandom.com/wiki/Special:VerifyUser?c=+&user=${encodeURIComponent(member.user.username)}&tag=${member.user.discriminator}`),
            );

        await previousVerificationThread.send({
            content: `Welcome back to the WoF Fanon Wiki verification process, ${userMention(member.user.id)}! Click the link below to get started and then send your Fandom username in this thread.`,
            components: [button],
        });

        await interaction.reply({
            ephemeral: true,
            content: `Please head over to ${channelMention(previousVerificationThread.id)} to finish verifying!`,
        });
    }
};
