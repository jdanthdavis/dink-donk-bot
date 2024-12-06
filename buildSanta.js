module.exports = {
  buildSanta: async (channel) => {
    try {
      channel.send({
        content:
          '# <a:dinkDonk:1303875324660158464> Secret Santa 2024 Is Live! <a:dinkDonk:1303875324660158464>\n## Closing date: 12/08 at 11:59PM EST\nUse the `/santa` command to join the list!\nWhen we reach the deadline the bot will DM each person their partner.\nGifts can be made/purchased from anywhere. If you get an international partner it may be cheaper to buy something from a company in their country instead of shipping one yourself.\n\n*Note: In the case that there is an uneven amount of santas then a random santa who agreed to do two people will be assigned the extra person.*',
      });
    } catch (error) {
      console.error('Error sending message.', error);
    }
  },
};
