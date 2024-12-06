const Santas = require('./models/secretSantaSchema');

module.exports = {
  getAllSantas: async () => {
    try {
      let records;
      // Query all records from the 'times' collection
      records = await Santas.find();

      // If no records are found, log an appropriate message
      if (records.length === 0) {
        console.log('No records found.');
      }

      //   console.log(records);
      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  },
};
