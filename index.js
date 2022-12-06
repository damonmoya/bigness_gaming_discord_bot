//process.env 
const dotenv = require('dotenv');

dotenv.config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("¡Bot listo!");
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  }
});

// Asigna la función como manejador del comando "!embed"
client.on("message", (message) => {
  if (message.content === "!embed") {
    handleEmbedCommand(
      message,
      "Título del mensaje",
      "Descripción del mensaje"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);

// Crea una función que maneje el comando "!embed"
function handleEmbedCommand(message, title, description) {
  // Crea una instancia de RichEmbed
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x00ae86)
    .setFooter("Pie de página del mensaje")
    .setTimestamp();

  // Envía el mensaje embebido al canal
  message.channel.send(embed);
}
