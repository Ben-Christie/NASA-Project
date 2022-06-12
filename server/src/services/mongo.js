// import mongoose module
const mongoose = require('mongoose');

const path = require('path');

// require for security purposes, and so our tests know the URL of our mongo database
require('dotenv').config();

// connect to our MongoDB Atlas database
const MONGO_URL = process.env.MONGODB_URL;

// check connection, 'once' used instead of 'on' to trigger only once
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established!');
});

// if we encounter an error while connecting
mongoose.connection.on('error', (err) => {
  console.log(err);
});

async function mongoConnect() {
  // connect to MongoDB before our server starts listening so all our data is available
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
