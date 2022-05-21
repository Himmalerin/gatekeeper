import {
    BaseCommandInteraction,
    ButtonInteraction,
    Client,
    GuildMember,
    Interaction,
    MessageActionRow,
    Modal,
    ModalActionRowComponent,
    ModalSubmitInteraction,
    TextInputComponent,
} from "discord.js";
import {Commands} from "../Commands";
import {roleIds} from "../../config.json";
import {TextInputStyles} from "discord.js/typings/enums";
import {ModalFields} from "../typings/enums";
import verifyAccount from "../scripts/verifyAccount";
import createHelpThread from "../scripts/createHelpThread";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction);
            return;
        }

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "verification":
                    await handleVerificationButton(client, interaction);
                    return;
                case "help":
                    await handleHelpThreadButton(client, interaction);
                    return;
            }
        }

        if (interaction.isModalSubmit()) {
            await handleModalSubmit(client, interaction);
            return;
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.followUp("An error has occurred");
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};

const handleVerificationButton = async (client: Client, interaction: ButtonInteraction): Promise<void> => {
    const member = interaction.member as GuildMember;

    if (member.roles.cache.has(roleIds.verified)) {
        await interaction.reply({
            ephemeral: true,
            content: `You are already verified.`,
        });

        return;
    }

    const modal = new Modal()
        .setCustomId("verificationModal")
        .setTitle("Verify your account");

    const wikiUsernameInput = new TextInputComponent()
        .setCustomId(ModalFields.WIKI_USERNAME)
        .setLabel("What's your wiki username?")
        .setStyle(TextInputStyles.SHORT);

    const firstActionRow = new MessageActionRow<ModalActionRowComponent>().addComponents(wikiUsernameInput);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
};

const handleHelpThreadButton = async (client: Client, interaction: ButtonInteraction) => {
    await createHelpThread(client, interaction);
};

const handleModalSubmit = async (client: Client, interaction: ModalSubmitInteraction) => {
    const discordAccount = interaction.guild.members.cache.get(interaction.user.id);
    const fandomUsername = interaction.fields.getTextInputValue(ModalFields.WIKI_USERNAME);

    await verifyAccount(client, interaction, discordAccount, fandomUsername);
};