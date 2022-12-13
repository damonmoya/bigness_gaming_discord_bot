const { SlashCommandBuilder } = require("discord.js");
const { ActionRowBuilder } = require("discord.js");
const { ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
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
    .addIntegerOption((option) =>
      option
        .setName("tamaño_grupo")
        .setDescription("Tamaño máximo del grupo")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(10)
    )
    .addStringOption((option) =>
      option
        .setName("detalles")
        .setDescription(
          "Detalles sobre la partida (por ejemplo, si es casual o competitivo, modos de juego, etc.)"
        )
        .setRequired(true)
    ),

  async execute(interaction, client) {
    if (interaction.isButton()) {
      const buttonId = interaction.customId.split("_")[1];
      const session = userReferences.user_sessions.find(
        (session) => session.id === buttonId
      );
      if (session) {
        // Check if user is already in session
        const userInSession = session.members.find(
          (member) => member.userId === interaction.user.id
        );
        if (userInSession) {
          interaction.reply({
            content: "¡Ya estás en esta sesión!",
            ephemeral: true,
          });
          return;
        }
        // Check if session is full
        if (session.members.length < session.maxMembers) {
          session.members.push({
            userId: interaction.user.id,
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

          // Update embed
          const channel = process.env.CONTACT_CHANNEL_ID;
          const messages = await client.channels.cache
            .get(channel)
            .messages.fetch();

          let message = null;
          let embed = null;
          //iterate over messages
          for (const [key, value] of messages) {
            if (value.embeds.length > 0) {
              if (value.embeds[0].footer.text === "ID de la sesión: " + buttonId) {
                message = value;
                embed = value.embeds[0];
                break;
              }
            }
          }
          if (message == null) {
            await interaction.reply({
              content: "¡No se encontró la sesión!",
              ephemeral: true,
            });
            return;
          }

          let color = "Green";
          let row = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setCustomId("joinButton_" + buttonId)
              .setLabel("Unirse")
              .setStyle(ButtonStyle.Success),
          ]);
          if (session.members.length === session.maxMembers) {
            color = "Red";
            row = new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setCustomId("joinButton_" + buttonId)
                .setLabel("Sesión llena")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
            ]);
          }

          const members = new Array(session.maxMembers);
          members.fill("Vacío");
          session.members.forEach((member, index) => {
            members[index] = `<@${member.userId}>`;
          });

          console.log("Embed:");
          console.log(embed);

          const embed2 = new EmbedBuilder()
            .setAuthor({
              name: embed.author.name,
              iconURL: embed.author.iconURL,
            })
            .setTitle(embed.title)
            .setDescription(embed.description)
            .setThumbnail(embed.thumbnail.url)
            .addFields(
              { name: "Juego", value: session.game },
              ...members.map((member, index) => {
                return {
                  name: "Miembro " + (index + 1),
                  value: member,
                  inline: true,
                };
              })
            )
            .setFooter({ text: "ID de la sesión: " + session.id })
            .setColor(color)
            .setTimestamp();

          message.edit({ embeds: [embed2], components: [row] });

          interaction.reply({
            content: `Te has unido a la sesión de <@${session.leaderId}>`,
            ephemeral: true,
          });
        } else {
          interaction.reply({
            content: "La sesión está llena",
            ephemeral: true,
          });
        }
      } else {
        interaction.reply({
          content: "No se ha encontrado la sesión",
          ephemeral: true,
        });
      }
      return;
    }

    const game = interaction.options.getString("juego");
    const details = interaction.options.getString("detalles");
    const players = interaction.options.getInteger("tamaño_grupo");

    //get game from videogames.json
    const gameStored = videogames.list.find(
      (videogame) => videogame.name === game
    );

    const uuidSession = uuidv4();

    userReferences.user_sessions.push({
      id: uuidSession,
      leaderId: interaction.user.id,
      game: game,
      description: details,
      thumbnail: gameStored.thumbnail,
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

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId("joinButton_" + uuidSession)
        .setLabel("Unirse")
        .setStyle(ButtonStyle.Success),
    ]);

    const user = interaction.user;

    const members = new Array(players);
    members.fill("Vacío");
    //first member is always the leader
    members[0] = `<@${user.id}>`;

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.avatarURL() })
      .setTitle(`${user.username} está buscando grupo para jugar`)
      .setDescription(details)
      .setThumbnail(gameStored.thumbnail)
      .addFields(
        { name: "Juego", value: game },
        ...members.map((member, index) => {
          return {
            name: "Miembro " + (index + 1),
            value: member,
            inline: true,
          };
        })
      )
      .setFooter({ text: "ID de la sesión: " + uuidSession })
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
