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

client.login(BOT_TOKEN);

const runRefreshJob = () => {
  console.log('CRON SCHEDULE RAN!');
};

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Delay the cron job to avoid immediate execution on startup
  setTimeout(() => {
    cron.schedule('*/2 * * * *', runRefreshJob, {
      timezone: 'America/New_York',
    });
  }, 10000); // Delay by 5 seconds (or adjust as needed)
});

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
