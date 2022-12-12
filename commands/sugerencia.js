const { SlashCommandBuilder } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

const userReferences = require("../data/userSuggestions.json");

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
      const uuid = uuidv4();
      const user = interaction.user;
      const description =
        interaction.fields.getTextInputValue("descriptionInput");
      const embed = new EmbedBuilder()
        .setTitle("Sugerencia de " + user.tag)
        .setDescription(description)
        .setFooter({ text: "ID: " + uuid })
        .setColor("#FFFF00")
        .setTimestamp();
      const channel = process.env.CONTACT_CHANNEL_ID;
      client.channels.cache
        .get(channel)
        .send({ embeds: [embed], components: [] });
      userReferences.userSuggestions.push({
        userId: user.id,
        id: uuid,
      });

      const fs = require("fs");
      fs.writeFile(
        "./data/userSuggestions.json",
        JSON.stringify(userReferences),
        (err) => {
          if (err) console.log(err);
        }
      );
      await interaction.reply({
        content: "¡Gracias por tu sugerencia!",
        ephemeral: true,
      });
    } else {
      await interaction.showModal(modal);
    }
  },
};
