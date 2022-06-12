// require default http package
const http = require('http');

// import dotenv for security, use .config as this is the only property we'll be accessing
// add .env file to gitignore so that it's not passed with our other source code
require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
// load SpaceX data from API
const { loadLaunchData } = require('./models/launches.model');

// make sure this doesn't conflict with the frontend port
// make our port configurable, so it'll default to 8000 but the server admin can specify which port it should run on using process.arg.env.PORT ||, this checks if there is an environmental variable defined in the package.json, e.g. ("start": "set PORT=5000 node src/server.js")

// we use the npm package dotenv to secure our usernames and passwords for our API's by listing them in the .env file in our server folder, we could also set the port value since it uses .env

const PORT = process.env.PORT || 8000;

// by passing app (defined in app.js) here, any middleware or route handlers we attach to the app object will respons to requests coming into our server, this allows us to seperate the our server from our express code which is in app.js file
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
