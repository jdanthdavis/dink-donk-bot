require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const santaInfoSchema = new Schema({
  santaName: {
    type: String,
    required: true, // Assuming the name is mandatory
  },
  shippingInfo: {
    type: String,
    required: true, // Assuming shipping info is mandatory
  },
  multiSanta: {
    type: Boolean,
    default: false, // Defaults to false if not provided
  },
  hobbies: {
    type: String,
    default: '', // Defaults to an empty string if not provided
  },
});

const santaSchema = new Schema({
  santaInfo: {
    type: santaInfoSchema,
    required: true, // Assuming the santaInfo object is mandatory
  },
});

const santaListCollection = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: 'secret_santa', // Set the specific database
});

// Add event listeners for connection
santaListCollection.once('open', () => {
  console.log('MongoDB connected successfully to the secret_santa database!');
});

santaListCollection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Create a model based on the schema
const Santas = santaListCollection.model('santas', santaSchema, 'santas'); // Specify collection 'times'
module.exports = Santas;
