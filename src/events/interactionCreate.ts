import {
    BaseCommandInteraction,
    ButtonInteraction,
    Client,
    FetchedThreads,
    GuildMember,
    Interaction,
    TextChannel,
} from "discord.js";
import {channelMention, userMention} from "@discordjs/builders";
import {Commands} from "../Commands";
import {verification} from "../../config.json";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";

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
    const member = interaction.member as GuildMember;

    if (member.roles.cache.has(verification.roleId)) {
        await interaction.reply({
            ephemeral: true,
            content: `You are already verified.`,
        });

        return;
    }

    const verificationChannel = await client.channels.fetch(verification.channelId) as TextChannel;

    const verificationThreads: FetchedThreads = await verificationChannel.threads.fetchActive();

    // Don't create duplicate verification threads
    const oldVerificationThread = verificationThreads.threads.find((thread) => thread.name === `verify-${member.user.id}`);
    if (oldVerificationThread) {
        await interaction.reply({
            ephemeral: true,
            content: `You already have an active verification thread at ${channelMention(oldVerificationThread.id)}.`,
        });

        return;
    }

    const thread = await verificationChannel.threads.create({
        name: `verify-${member.user.id}`,
        autoArchiveDuration: 60,
    });

    // Automatically delete the "thread started" message
    const threadMessage = await verificationChannel.messages.fetch(thread.id);
    await threadMessage.delete();

    await thread.send({
        content: `Welcome to the WoF Fanon Wiki verification process, ${userMention(member.user.id)}! Click the button below to get started and then send your Fandom username in this thread.`,
        components: [{
            components: [{
                type: MessageComponentTypes.BUTTON,
                style: MessageButtonStyles.LINK,
                label: "Link accounts",
                url: `https://community.fandom.com/wiki/Special:VerifyUser?useskin=fandomdesktop&c=+&user=${encodeURIComponent(member.user.username)}&tag=${member.user.discriminator}`,
            }],
            type: MessageComponentTypes.ACTION_ROW,
        }],
    });

    await interaction.reply({
        ephemeral: true,
        content: `Please head over to ${channelMention(thread.id)} to verify!`,
    });
};
