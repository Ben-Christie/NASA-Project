// import axios
const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
// for checking if planet is in db
const planets = require('./planets.mongo');

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const DEFAULT_FLIGHT_NUMBER = 100;

// populate the mongo db database with the launches frmo the SpaceX API
async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // turn off pagination so we can get all the data in 1 big request
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  // validate response status code
  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    // use flatMap() to flatten the payloads array, which consists of customers array into a single array of customers
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    // populate launches collection
    await saveLaunch(launch);
  }
}

// load SpaceX data from API
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  // if launch 1 already exists in our db then we know we've most likely already downloaded the SpaceX data and dont need to make another request to the API
  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  // findById -> searches for the object ID not our flight number
  return await findLaunch({
    // findOne with the ID/flightNumber passed
    flightNumber: launchId,
  });
}

// get latest flight number
async function getLatestFlightNumber() {
  // findOne will take the first value returned so we need to sort by flightNumber from highest to lowest (that's why we put the '-' infront of flightNumber in the sort function), if we wanted to sort from lowest to highest we'd leave out the '-'
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

  // if theres no latest launch
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

// launches.values() give us an IterableIterator of values in the map, we could use Array.from to convert to an array so that we can return as json
async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());

  // pass {} to find all
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    // sort on a specified property , pass 1 for ascending order, pass -1 for descending order
    .sort({ flightNumber: 1 })
    // used for pagination, skip defines the number of values we want to skip over
    .skip(skip)
    // used for pagination, limit defines the max number of values we can show a page
    .limit(limit);
}

// save launch to db
async function saveLaunch(launch) {
  // findOneAndUpdate only returns the properties we set in our function, no  "$setOnInsert": { "__v": 0} more secure
  await launchesDatabase.findOneAndUpdate(
    {
      // check if already exists by comparing this flightNumber with the passed launch's flightNumber
      flightNumber: launch.flightNumber,
    },
    // what are we passing
    launch,
    // enable upsert = update/insert (completes one of these functions depending on whether it exists or not)
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  // validate to ensure target planet is in db, findOne just return the JSON not a list
  const planet = await planets.findOne({
    // check if planet with name as target is in db
    keplerName: launch.target,
  });

  // if planet doesn't exist in db
  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  // save launch to database
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  // not using upsert because we dont want to insert, only update
  const aborted = await launchesDatabase.updateOne(
    // if a launch with this exists
    {
      flightNumber: launchId,
    },
    // update it with these values
    {
      upcoming: false,
      success: false,
    }
  );

  // ensure 1 document was successfully aborted
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
