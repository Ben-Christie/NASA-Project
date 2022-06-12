// here we're going to tak advantage of our built in express router
const express = require('express');

// destructure to get all our functions and it also enables us to use them directly
const { httpGetAllPlanets } = require('./planets.controller');

const planetsRouter = express.Router();

// get function on /planet route with the function httpG, this function will come from the planets controller
// in the request.js in the client, we'll get the response for the endpoint
// because we mounted our middleware in the app,js, we just put /, if we didn't do that we'd write /planets
planetsRouter.get('/', httpGetAllPlanets);

// export for use in app.js
module.exports = planetsRouter;
