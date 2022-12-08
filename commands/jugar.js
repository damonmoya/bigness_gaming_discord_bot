const { SlashCommandBuilder } = require("discord.js");
const { ActionRowBuilder } = require("discord.js");
const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

const videogames = require("../data/videogames.json");
const userReferences = require("../data/userSessions.json");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jugar")
    .setDescription("Busca grupo para jugar")
    .addStringOption((option) =>
      option
        .setRequired(true)
        .setName("juego")
        .setDescription("El juego en que buscas grupo para jugar")
        .addChoices(...videogames.list)
    )
    .addStringOption((option) =>
      option
        .setName("detalles")
        .setDescription(
          "Detalles sobre la partida (por ejemplo, si es casual o competitivo, modos de juego, etc.)"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("número_jugadores")
        .setDescription(
          "Número de jugadores totales del grupo (contando contigo)"
        )
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const game = interaction.options.getString("juego");
    const details = interaction.options.getString("detalles");
    const players = interaction.options.getInteger("número_jugadores");

    userReferences.user_sessions.push({
      id: uuidv4(),
      leaderId: interaction.user.id,
      game: game,
      maxMembers: players,
      members: [
        {
          userId: interaction.user.id,
        },
      ],
    });

    const fs = require("fs");
    fs.writeFile(
      "./data/userSessions.json",
      JSON.stringify(userReferences),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    const uuidJoinButton = uuidv4();

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId(uuidJoinButton)
        .setLabel("Unirse")
        .setStyle(ButtonStyle.Success),
    ]);

    const user = interaction.user;
    console.log(user);

    const members = new Array(players);
    members.fill("Vacío");

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.avatarURL() })
      .setTitle(`${user.username} busca grupo para jugar a ${game}`)
      .setDescription(details)
      .addFields(
        { name: "Líder", value: `<@${user.id}>` },
        ...members.map((member, index) => {
          return {
            name: "Miembro " + (index + 1),
            value: member,
            inline: true,
          };
        })
      )
      .setFooter({ text: "¡Puedes unirte con el botón de abajo!" })
      .setColor("Green")
      .setTimestamp();

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild.channels.cache.get(process.env.FIND_GROUP_CHANNEL_ID);
    channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({
      content: `¡Grupo creado en <#${channel.id}>!`,
      ephemeral: true,
    });
  },
};
