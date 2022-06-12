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

app.use(morgan('combined'));

// for parsing json in any requests incase we're passing in some data, returns object
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// middleware for api version 1, mounted on /v1
app.use('/v1', api);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
