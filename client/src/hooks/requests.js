// these functions are defined by our API

// as they're all running on our single api we can create a const
// specify port as our client is running on a different port, we did update to run on the same port, this is still important
// when using docker to upload project to run in the cloud, change thte api url to just const API_URL = 'v1'; as we wont be using local host and want our url to respond to the cloud
const API_URL = 'v1';

// TODO: Once API is ready.

// Load planets and return as JSON.
async function httpGetPlanets() {
  // both our fetch and json functions return a promise so we await to make sure those promises are resolved
  const response = await fetch(`${API_URL}/planets`);
  // return response (our data for the habitable planets)
  return await response.json();
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await response.json();

  // sort
  return fetchedLaunches.sort((a, b) => {
    // compares values and returns negative value if a is less than b
    return a.flightNumber - b.flightNumber;
  });
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    // fetch defaults to GET, must define POST
    return await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });
  } catch (err) {
    // handle error, see line 38 of useLaunches.js for context
    return {
      ok: false,
    };
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'delete',
    });
  } catch (err) {
    console.log(err);
    // handle error, see line 58 of useLaunches.js for context
    return {
      ok: false,
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
