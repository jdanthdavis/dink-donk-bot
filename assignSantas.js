require('dotenv').config();
const mongoose = require('mongoose');
const { devSantas, Santas } = require('./models/secretSantaSchema'); // Adjust the path to your schema file

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]]; // Swap elements
  }
  return array;
}

async function assignSantas() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'secret_santa' });

    const allSantas = await Santas.find({});

    // Extract relevant data
    const santas = allSantas.map((x) => ({
      santaName: x.santaInfo.santaName,
      discordId: x.santaInfo.discordId,
      multiSanta: x.santaInfo.multiSanta,
      shippingInfo: x.santaInfo.shippingInfo, // Include additional fields if needed
      hobbies: x.santaInfo.hobbies, // Include additional fields if needed
    }));

    // Shuffle the array
    const shuffledSantas = shuffleArray(santas);

    const santasLength = shuffledSantas.length;

    // Create the assignment list, ensuring no one is assigned to themselves
    const assignments = [];

    // If the number of Santas is odd, choose a multiSanta to assign two people to
    if (santasLength % 2 !== 0) {
      const multiSantaCandidates = shuffledSantas.filter(
        (santa) => santa.multiSanta
      );
      const pickedSanta =
        multiSantaCandidates[
          Math.floor(Math.random() * multiSantaCandidates.length)
        ];

      // Ensure the pickedSanta is assigned to two people
      const remainingSantas = shuffledSantas.filter(
        (santa) => santa.santaName !== pickedSanta.santaName
      );
      const secondPerson =
        remainingSantas[Math.floor(Math.random() * remainingSantas.length)];

      // Add the assignments for the multiSanta
      assignments.push({
        santaName: secondPerson.santaName,
        santaId: secondPerson.discordId,
        // assignedTo: pickedSanta.santaName,
        whoTheySendTo: pickedSanta, // Include the entire object
      });
    }

    // Loop through the shuffled list and assign each person to someone else, ensuring no self-assignment
    for (let i = 0; i < santasLength; i++) {
      const santa = shuffledSantas[i];
      const recipient = shuffledSantas[(i + 1) % santasLength]; // Wrap around to the first person if at the end
      if (santa.santaName !== recipient.santaName) {
        assignments.push({
          santaName: recipient.santaName,
          santaId: recipient.discordId,
          // assignedTo: santa.santaName,
          whoTheySendTo: santa, // Include the entire object
        });
      }
    }

    // Log the assignments
    // console.log('Santa Assignments:', assignments);
    return assignments;
  } catch (error) {
    console.error('Error fetching Santa records:', error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = assignSantas;
