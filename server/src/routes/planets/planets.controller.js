// this has been put beside the router instead of in its own file as the router will be making direct use of it

const { getAllPlanets } = require('../../models/planets.model');

async function httpGetAllPlanets(req, res) {
  // use return to ensure status is only set once, prevents unexpected errors
  return res.status(200).json(await getAllPlanets());
}

// export functions for use in front-end
module.exports = {
  httpGetAllPlanets,
};
