// bridge our model and our router using the controller
const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model');

// for pagination
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  // launches.values() give us an IterableIterator of values in the map, we could use Array.from to convert to an array so that we can return as json, its better practice to implement this in the model
  // return res.status(200).json(getAllLaunches());

  // req.query gets the params passed in the url e.g. http://localhost:8000/v1/launches?limit=5&page=1, req.query would return limit:5, page:1
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  // validate incoming data, check if any data is missing or undefined
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  // whatever value is passed in as that date, unix timestamp or formatted date, our new date will be converted into a date
  launch.launchDate = new Date(launch.launchDate);
  // could also do: launch.launchDate.toString() === 'Invalid Date'
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await scheduleNewLaunch(launch);
  // 201 Created
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  // get launch id, in our endpoint we defined as :id so here we can call id
  const launchId = Number(req.params.id);

  const existsLaunch = await existsLaunchWithId(launchId);

  // if launch doesn't exist
  if (!existsLaunch) {
    // return statement is  used so the rest of the function isn't executed
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }

  // if launch does exist, return aborted information
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
