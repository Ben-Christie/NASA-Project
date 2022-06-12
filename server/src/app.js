const path = require('path');
const express = require('express');

// import the cors package to allow us to move between our 2 ports i.e. port 3000 and 8000
const cors = require('cors');

// morgan for logging requests
const morgan = require('morgan');

// v1 api
const api = require('./routes/api');

// app defined here
const app = express();

// middleware

// initiate cors middleware, will allow all cross-origin requests from anywhere on the internet, only allow from port 8000 to 3000
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

// morgan for logging http requests that come into the server

// log looks like: ::1 - - [01/Jun/2022:13:21:43 +0000] "GET /planets HTTP/1.1" 304 - "http://localhost:3000/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
app.use(morgan('combined'));

// for parsing json in any requests incase we're passing in some data, returns object
app.use(express.json());

// serve our client code from our api (we used the build function to put it in our server), this allows our client to be served on the same port as our api (run: npm run server and go to localhost:8000 to see our front end running on the same port as our server)
app.use(express.static(path.join(__dirname, '..', 'public')));

// middleware for api version 1, mounted on /v1
app.use('/v1', api);

/*
  If we wanted to use a version 2 at some point we could create another file for v2Api
  app.use('/v2/', v2Api);
  This would allow us to keep v1 as well and support both incase some of our users can't update to v2
*/

//to avoid issue of endpoint not loading due to index.html not being a route, we do the following so that the user doesn't have to specify that they want to use the index.html and the launch page works as expected on first load'
// we put the asterisk is used to match any endpoint that isn't matches above, this helps us with client side routing, so react can handle the routing if our API cant
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
