const { SlashCommandBuilder } = require("discord.js");

const userReferences = require("../data/userReferences.json");

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
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID de la sugerencia")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const veredicto = interaction.options.getString("veredicto");
    const id = interaction.options.getInteger("id");

    //get userSuggestion from userReferences where suggestionId === id
    const userSuggestion = userReferences.userSuggestions.find(
      (suggestion) => suggestion.suggestionId === id
    );
    const channel = process.env.CONTACT_CHANNEL_ID;
    const messages = await client.channels.cache.get(channel).messages.fetch();
    const messagesKeys = messages.keys();
    //get keys of messages
    //sleep for 1 second
    await new Promise((r) => setTimeout(r, 1000));
    console.log(messages.keys());
    //find key === userSuggestion.messageId
    //iterate over keys
    let message;
    for (const key of messagesKeys) {
      console.log(key.toString());
      if (key.toString() === userSuggestion.messageId) {
        message = messages.get(key);
        break;
      }
    }
    console.log(message);
    if (!message) {
      await interaction.reply("¡No se encontró la sugerencia!");
      return;
    }
    const embed = message.embeds[0];

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
