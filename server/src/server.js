// require default http package
const http = require('http');

// import dotenv for security, use .config as this is the only property we'll be accessing
// we use the npm package dotenv to secure our usernames and passwords for our API's by listing them in the .env file in our server folder, we could also set the port value since it uses .env
// add .env file to gitignore so that it's not passed with our other source code
require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
// load SpaceX data from API
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  // await loadPlanetsData so data is ready for users to use
  await loadPlanetsData();
  await loadLaunchData();

  // start our server
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
