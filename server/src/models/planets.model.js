/*
  Streaming Large Data Files
  The csv-parse package implements the stream API for large data files, this is the recommended approach for maximum power and ensures scalability of much larger data sets, read data line by line as its read from our hard drive
  In Node all stream are implemented using the event emitter, where the events are emitted by node and we just react to the event on that stream using the on function
*/

// fileSystem (or fs) is the default Node file reader
const fs = require('fs');
const path = require('path');

// destructuring, name = parse
const { parse } = require('csv-parse');

// mongoose model, think of this as the array where we'll store our planets
const planets = require('./planets.mongo');

// create a function that filters out only those planets which are confirmed to be habitable
// insolation flux (koi_insol) or Stellar flux refers to the amount of light a planet gets
// the planet must not be more than 1.6 times the size of earth as well (koi_prad)
function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

/*
  Promise Example:
  const promise = new Promise((resolve, reject) => {
    // 42 passed as result to .then
    resolve(42);
  });
  promise.then((result) => {
    console.log(result); // 42
  });
  const result = await promise;
*/

function loadPlanetsData() {
  // this array is solely responsible for counting the number of habitable planets correctly
  const habitablePlanets = [];

  // using a promise so we know when we have all our data available
  return new Promise((resolve, reject) => {
    // create a read stream using our csv file, this will give us an event emiiter that we can react to event with our on function
    // read stream just reads the raw data in bits and bytes
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      // parse the results so we can understand the data we're receiving
      // the pipe function is meant to connect a readbale stream source to a writable stream desination
      // kepler file is our source and the parse function is our destination
      .pipe(
        // here we're saying that comments in our file begin with a #
        // we set columns to true so that we return each row as a javascript object with key/value pairs
        parse({
          comment: '#',
          columns: true,
        })
      )
      // data (in brackets) refers to each column, 'data' refers to the data event
      .on('data', async (data) => {
        // push each data chunk on to the array, only push if the planet is habitable
        if (isHabitablePlanet(data)) {
          // add planet to mongo database, push each planet to the habitablePlanets array for counting
          habitablePlanets.push(savePlanet(data));
        }
      })
      .on('error', (err) => {
        // error handling
        console.log(err);

        // reject promise when we get an error
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);

        // call resolve when we're done parsing data, and our habitable planets are populated and ready to go
        resolve();
      });
  });
}

// parse the results so we can understand the data we're receiving
// the pipe function is meant to connect a readable stream source to a writable stream desination
// kepler file is our source and the parse function is our destination

async function getAllPlanets() {
  // look at find docs, insert {} to select all (have no filters)
  return await planets.find(
    {},
    {
      // explicitly exclude these values
      _id: 0,
      __v: 0,
    }
  );
}

// save planet to mongo
async function savePlanet(planet) {
  try {
    // upsert = insert + update, if doesn't exist inserts it, else updates existing
    await planets.updateOne(
      // first set of brackets checks if existing
      {
        // kepler_name = name of column
        keplerName: planet.kepler_name,
      },
      // this 2nd bracket includes what we want to insert/update so long as upsert is set to true in the 3rd brackets
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

// we want to return our planets to our UI
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
