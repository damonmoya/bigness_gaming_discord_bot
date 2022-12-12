const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const userSuggestions = require("../data/userSuggestions.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("decidir")
    .setDescription("Decidir el veredicto una sugerencia")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("ID de la sugerencia")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("veredicto")
        .setDescription("Veredicto de la sugerencia")
        .addChoices(
          { name: "Aprobar", value: "approve" },
          { name: "Rechazar", value: "deny" }
        )
        .setRequired(true)
    ),

  async execute(interaction, client) {
    if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
      await interaction.reply({
        content: "¡No tienes permisos para usar este comando!",
        ephemeral: true,
      });
      return;
    }
    const veredicto = interaction.options.getString("veredicto");
    const id = interaction.options.getString("id");

    const channel = process.env.CONTACT_CHANNEL_ID;
    const messages = await client.channels.cache.get(channel).messages.fetch();

    let message = null;
    let found = false;
    let embed = null;
    //iterate over messages
    messages.forEach((msg) => {
      if (msg.embeds.length > 0) {
        embed = msg.embeds[0];
        if (embed.footer.text.includes(id)) {
          message = msg;
          found = true;
          return;
        }
      }
    });
    if (!found) {
      await interaction.reply({
        content: "¡No se encontró la sugerencia!",
        ephemeral: true,
      });
      return;
    }

    let text = "Sugerencia aprobada";
    let color = "#00FF00";
    if (veredicto === "deny") {
      text = "Sugerencia denegada";
      color = "#FF0000";
    }

    const embed2 = new EmbedBuilder()
      .setTitle(embed.title)
      .setDescription(embed.description)
      .setFooter({ text: text })
      .setColor(color)
      .setTimestamp();
    message.edit({ embeds: [embed2], components: [] });

    // Remove suggestion from userSuggestions.json
    const index = userSuggestions.userSuggestions.findIndex(
      (suggestion) => suggestion.id === id
    );

    if (index > -1) {
      userSuggestions.userSuggestions.splice(index, 1);
    }

    const fs = require("fs");
    fs.writeFile(
      "./data/userSuggestions.json",
      JSON.stringify(userSuggestions),
      (err) => {
        if (err) console.log(err);
      }
    );

    await interaction.reply({content: text, ephemeral: true});
  },
};
