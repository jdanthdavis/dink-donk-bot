const { Events, Client, GatewayIntentBits, Partials } = require('discord.js');
const { buildSanta } = require('./buildSanta');
const cron = require('node-cron');
const assignSantas = require('./assignSantas');
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

const deadline = new Date('2024-12-08T23:59:00-05:00'); // 12/08/2024 at 11:59 PM EST

let deadlineReached = false; // Flag to track bot readiness
let prevMsg = null;

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  if (!deadlineReached) {
    cron.schedule('0 * * * *', sendTimeRemaining, {
      timezone: 'America/New_York',
    });
  } else {
    console.log('The deadline has been reached. Not running cron scheduler.');
  }
});

client.login(BOT_TOKEN);

const sendTimeRemaining = async () => {
  const currentTime = new Date();
  const timeDifference = deadline - currentTime; // Time remaining in milliseconds
  const channel = await client.channels.fetch(SANTA_CHANNEL);

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

  const remainingMessage = `## Time remaining until deadline: ${remainingDays} days, ${remainingHours} hours, and ${remainingMinutes} minutes.`;

  try {
    if (prevMsg) {
      await prevMsg.edit(remainingMessage);
    } else {
      prevMsg = await channel.send(remainingMessage);
    }
  } catch (error) {
    console.log('Error updating time. ', error);
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
  if (message.author.id === CLIENT_ID || message.author.id !== MY_ID) return;
  const channel = await client.channels.fetch(SANTA_CHANNEL);
  const content = message.content.toLowerCase();

  switch (content) {
    case '.buildsanta':
      buildSanta(channel);
      return;
    case '.assignsantas':
      const assignments = await assignSantas(channel);
      assignments.forEach(async (x) => {
        const userToDm = x.santaId;
        const recipient = x.whoTheySendTo.santaName;
        const username = await client.users.fetch(userToDm);

        try {
          const user = await client.users.fetch(userToDm);
          // Send a DM to the user
          await user.send(
            `You've been assigned **${recipient}!**\n**Their shipping info is:** ${x.whoTheySendTo.shippingInfo}\n**Their hobbies/likes are:** ${x.whoTheySendTo.hobbies}\n\n**Note:** When shipping you should not include your name on the sender section on your label!`
          );

          channel.send({
            content: `${username} has been assigned a partner!`,
          });
          console.log('DM sent successfully');
        } catch (error) {
          console.error('ERROR!', error);
        }
      });
      return;
    default:
      console.log('Command does not exist.');
      return;
  }
});
