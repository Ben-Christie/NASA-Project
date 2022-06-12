// this file will be used for creating a schema/structure for our db specific for our launches
const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
  // here you can see that we can specify certain params for each piece of data such as if its required, a max and min val, default val, etc.
  flightNumber: {
    type: Number,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    type: String,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// connect launches schema
// launches schema is assigned to our Launch collection (collection name should always be singular here)
module.exports = mongoose.model('Launch', launchesSchema);
