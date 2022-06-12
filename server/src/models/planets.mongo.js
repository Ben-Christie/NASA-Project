// this file will be used for creating a schema/structure for our db specific for our planets
const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
  // keep name consistent with front-end see line 8/9 client/src/pages/Launch.js
  keplerName: {
    type: String,
    required: true,
  },
});

// Connects planetSchema with the "planets" collection
module.exports = mongoose.model('Planet', planetSchema);
