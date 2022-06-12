// here we're going to tak advantage of our built in express router
const express = require('express');

// destructure to get all our functions and it also enables us to use them directly
const { httpGetAllPlanets } = require('./planets.controller');

const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

// export for use in app.js
module.exports = planetsRouter;
