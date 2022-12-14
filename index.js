const dotenv = require("dotenv");
dotenv.config();

const { InteractionType } = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on("ready", () => {
  console.log("¡Bot listo!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  //if (!interaction.isChatInputCommand()) return;
  let command = interaction.client.commands.get(interaction.commandName);

  if (interaction.type === InteractionType.ModalSubmit) {
    command = interaction.client.commands.get("sugerencia");
  }

  //interaction button
  if (interaction.isButton()) {
    if (interaction.customId.includes("joinButton_")) {
      command = interaction.client.commands.get("jugar");
    }
  }


  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
