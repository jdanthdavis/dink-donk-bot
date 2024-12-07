require('dotenv').config();
const mongoose = require('mongoose');
const { devSantas } = require('./models/secretSantaSchema'); // Adjust the path to your schema file

async function getAllSantas() {
  console.log('Fetching all Santa records...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'secret_santa' });

    const allSantas = await devSantas.find({});
    console.log('All Santa Records:', allSantas);

    return allSantas; // Optional: return the records if needed
  } catch (error) {
    console.error('Error fetching Santa records:', error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = getAllSantas;
