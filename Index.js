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
let prevMsg = null;

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
  const channel = await client.channels.fetch('1248914770833313835');

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

  const remainingMessage =
    `content:
          '# <a:dinkDonk:1303875324660158464> Secret Santa 2024 Is Live! <a:dinkDonk:1303875324660158464>\n## Closing date: 12/08 at 11:59PM EST\nUse the ` /
    santa` command to join the list!\nWhen we reach the deadline the bot will DM each person their partner.\nGifts can be made/purchased from anywhere. If you get an international partner it may be cheaper to buy something from a company in their country instead of shipping one yourself.\n\n*Note: In the case that there is an uneven amount of santas then a random santa who agreed to do two people will be assigned the extra person.*'\mTime remaining until deadline: ${remainingDays} days, ${remainingHours} hours, and ${remainingMinutes} minutes.`;

  if (prevMsg) {
    await prevMsg.edit(remainingMessage);
  } else {
    prevMsg = await channel.send(remainingMessage);
  }

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
