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

const deadline = new Date('2024-12-08T23:59:00-05:00'); // 12/08/2024 at 11:59 PM EST

let deadlineReached = false; // Flag to track bot readiness

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  if (!deadlineReached) {
    // Initialize cron job after a short delay to avoid immediate execution
    setTimeout(() => {
      cron.schedule('*/2 * * * *', sendTimeRemaining, {
        timezone: 'America/New_York',
      });
    }, 10000); // Adjust delay as needed (e.g., 5 seconds)
  }
});

client.login(BOT_TOKEN);

const sendTimeRemaining = async () => {
  const currentTime = new Date();
  const timeDifference = deadline - currentTime; // Time remaining in milliseconds

  if (timeDifference <= 0) {
    deadlineReached = true;
    console.log('The deadline has passed.');
    return;
  }

  // Calculate the remaining time
  const remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const remainingMinutes = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
  );

  const remainingMessage = `Time remaining until deadline: ${remainingDays} days, ${remainingHours} hours, and ${remainingMinutes} minutes.`;

  console.log(remainingMessage);

  // Send the message to the specified channel
  // const channel = await client.channels.fetch(SANTA_CHANNEL);
  // channel.send(remainingMessage);
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
