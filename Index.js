const { Events, Client, GatewayIntentBits, Partials } = require('discord.js');
const { buildSanta } = require('./buildSanta');
const cron = require('node-cron');
require('dotenv').config();

const { BOT_TOKEN, CLIENT_ID, SANTA_CHANNEL, MY_ID } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let isBotReady = false; // Flag to track bot readiness

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  isBotReady = true; // Set the flag once the bot is ready

  // Initialize cron job after a short delay to avoid immediate execution
  setTimeout(() => {
    cron.schedule('*/2 * * * *', runRefreshJob, {
      timezone: 'America/New_York',
    });
  }, 10000); // Adjust delay as needed (e.g., 5 seconds)
});

client.login(BOT_TOKEN);

const runRefreshJob = () => {
  // Check if the bot is ready and make sure the cron job isn't executed immediately after the bot starts
  if (isBotReady) {
    console.log('CRON SCHEDULE RAN!');
  } else {
    console.log('Skipping cron job execution because bot is not ready yet.');
  }
};

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const commandName = interaction.commandName;

    switch (commandName) {
      case 'santa':
        const secretSantaCommand = require('./commands/secretSantaCommand');
        await secretSantaCommand.execute(interaction);
        // .then(() => {
        //   // stuff to after the command executes.
        // });
        return;
      default:
        console.log('No such command.');
    }
  }
});

// Forces the bot to refresh the board.
client.on('messageCreate', async (message) => {
  if (message.author.id === CLIENT_ID && message.author !== MY_ID) return;
  const channel = await client.channels.fetch(SANTA_CHANNEL);
  const content = message.content.toLowerCase();

  switch (content) {
    case '.buildsanta':
      buildSanta(channel);
      return;
    default:
      console.log('Command does not exist.');
      return;
  }
});
