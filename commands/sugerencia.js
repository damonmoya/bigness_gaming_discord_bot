const { SlashCommandBuilder } = require("discord.js");

const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("¡Deja tu sugerencia!"),
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId("suggestModal")
      .setTitle("Deja tu sugerencia");

    const descriptionInput = new TextInputBuilder()
      .setCustomId("descriptionInput")
      .setLabel("Descripción")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(50)
      .setMaxLength(500)
      .setPlaceholder("Escribe tu sugerencia aquí...");

    const firstActionRow = new ActionRowBuilder().addComponents(
      descriptionInput
    );

    modal.addComponents(firstActionRow);

    if (interaction.type === InteractionType.ModalSubmit) {
      //get user from interaction
      const user = interaction.user;
      //get the values from the modal
      const description =
        interaction.fields.getTextInputValue("descriptionInput");
      //send the values to channel
      const embed = new EmbedBuilder()
        .setTitle("Sugerencia de " + user.tag)
        .setDescription(description)
        .setColor("#00FF00")
        .setTimestamp();
      const channel = process.env.CONTACT_CHANNEL_ID;
      client.channels.cache.get(channel).send({ embeds: [embed] });
      await interaction.reply("¡Gracias por tu sugerencia!");
    } else {
      await interaction.showModal(modal);
    }
  },
};
