const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("decidir")
    .setDescription("Decidir una sugerencia")
    .addStringOption((option) =>
      option
        .setName("veredicto")
        .setDescription("Veredicto de la sugerencia")
        .addChoices(
          { name: "Aprobar", value: "approve" },
          { name: "Rechazar", value: "deny" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("ID de la sugerencia")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const veredicto = interaction.options.getString("veredicto");
    const id = interaction.options.getString("id");

    const channel = process.env.CONTACT_CHANNEL_ID;
    const messages = await client.channels.cache.get(channel).messages.fetch();

    let message;
    let embed;
    //iterate over messages
    messages.forEach((msg) => {
      if (msg.embeds.length > 0) {
        embed = msg.embeds[0];
        if (embed.footer.text === "ID: " + id) {
          message = msg;
        }
      }
    });
    if (!message) {
      await interaction.reply("¡No se encontró la sugerencia!");
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
    await interaction.reply(text);
  },
};
