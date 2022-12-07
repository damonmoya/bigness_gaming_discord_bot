const { SlashCommandBuilder } = require("discord.js");

const userReferences = require("../data/userReferences.json");

const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
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
      await interaction.reply("¡Gracias por tu sugerencia!");
      const id = userReferences.suggestion_id;
      const suggestionId = id + 1;
      const user = interaction.user;
      const description =
        interaction.fields.getTextInputValue("descriptionInput");
      const embed = new EmbedBuilder()
        .setTitle("Sugerencia de " + user.tag + " (ID: " + suggestionId + ")")
        .setDescription(description)
        .setColor("#FFFF00")
        .setTimestamp();
      /*       const row = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("buttonSuggestAccept")
          .setLabel("Aceptar sugerencia")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("buttonSuggestDeny")
          .setLabel("Rechazar sugerencia")
          .setStyle(ButtonStyle.Danger),
      ]); */
      const channel = process.env.CONTACT_CHANNEL_ID;
      client.channels.cache
        .get(channel)
        .send({ embeds: [embed], components: [] });
      //get the message that was just sent
      const lastMessage = await client.channels.cache.get(channel).messages.fetch({
        limit: 1,
      });
      //sleep for 1 second
      await new Promise((r) => setTimeout(r, 1000));
      //add user and randomId to userReferences.json, inside usersSuggestions
      userReferences.suggestion_id = suggestionId;
      userReferences.userSuggestions.push({
        messageId: lastMessage.first().id,
        suggestionId: suggestionId,
        userId: user.id,
      });
      //save userReferences.json
      const fs = require("fs");
      fs.writeFile(
        "./data/userReferences.json",
        JSON.stringify(userReferences),
        (err) => {
          if (err) console.log(err);
        }
      );
    } else {
      await interaction.showModal(modal);
    }
  },
};
