const { SlashCommandBuilder } = require('discord.js');
const Santas = require('../models/secretSantaSchema');
require('dotenv').config();
const { SANTA_CHANNEL } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('santa')
    .setDescription('x')
    .addStringOption((option) => {
      return option
        .setName('name')
        .setDescription('Your first & last name.')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('shipping-info')
        .setDescription('Your shipping address.')
        .setRequired(true);
    })
    .addBooleanOption((option) => {
      return option
        .setName('multi-person-santa')
        .setDescription('Are you willing to be santa for TWO people if needed?')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('likes-hobbies')
        .setDescription(
          'List your hobbies/likes for gift ideas. Separate each with a comma: Example1, example2, ect.'
        )
        .setRequired(true);
    }),

  async execute(interaction) {
    const name = interaction.options.getString('name');
    const shippingInfo = interaction.options.getString('shipping-info');
    const multiSanta = interaction.options.getBoolean('multi-person-santa');
    const hobbies = interaction.options.getString('likes-hobbies');
    const channel = interaction.guild.channels.cache.get(SANTA_CHANNEL);

    try {
      // Insert the data into MongoDB
      const newSanta = {
        santaInfo: {
          santaName: name,
          shippingInfo: shippingInfo,
          multiSanta: multiSanta,
          hobbies: hobbies,
        },
      };

      await Santas.create(newSanta); // Save the data to the database

      const totalSantas = await Santas.countDocuments();

      // Respond to the user
      await interaction.reply({
        content: `Submission successfully received!\n\n**Name:** ${name}\n**Shipping info:** ${shippingInfo},\n**Santa for two?:** ${
          multiSanta ? 'Yes' : 'No'
        }\n**Hobbies/likes:** ${hobbies}`,
        ephemeral: true,
      });

      // Notify the specified channel
      if (channel) {
        await channel.send(
          `<a:dinkDonk:1303875324660158464> New Santa has joined! Total Santas: ${totalSantas} <a:dinkDonk:1303875324660158464>`
        );
      }
    } catch (error) {
      console.error('Error processing the Santa submission:', error);

      // Notify the user in case of an error
      await interaction.reply({
        content:
          'There was an error while processing your submission. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
