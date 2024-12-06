const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { GUILD_ID, CLIENT_ID, BOT_TOKEN } = process.env;

// Initialize REST client
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// Read all command files from src/commands
const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

// Loop through each command file and add them to the commands array
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// Register commands with Discord's API
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands with Discord
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), // Use applicationGlobalCommands() for global commands
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error);
  }
})();
