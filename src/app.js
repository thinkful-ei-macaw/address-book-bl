/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const uuid = require('uuid/v4');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const contactInfo = [];

app.get('/', (req, res) => {
  res.json(contactInfo);
});

app.post('/address', (req, res) => {
  //destruture contactInfo object
  const { firstName, lastName, address1, address2 = 'none',
    city, state, zip } = req.body;
  
  //validate values, all required except address2
  if (!lastName) {
    return res.status(400)
      .send('first name required');
  }
  if (!lastName) {
    return res.status(400)
      .send('last name required');
  }
  if (!address1) {
    return res.status(400)
      .send('primary address required');
  }
  if (!city) {
    return res.status(400)
      .send('city is required');
  }
  if (!state) {
    return res.status(400)
      .send('state is required');
  }
  //validate state value; 2 characters
  //const letters = state.match(/^[A-Za-z]+$/);
  if (!state.length === 2 && !state.match(/^[A-Za-z]+$/)) {
    return res.status(400)
      .send('state must be 2 letters');
  }
  if (!zip || !(String(zip).length === 5) && (isNaN(zip))) {
    return res.status(400)
      .send('zip required: must be 5 numbers');
  }

  const id = uuid();
  const newContact = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };
  
  contactInfo.push(newContact);

  res.send('all valid contact info');
});

app.delete('/address/:addressId', (req, res) => {
  const { addressId } = req.params;
  const index = contactInfo.findIndex(info => info.id === addressId);
  
  if (index === -1) {
    return res.status(404)
      .send('contact not found');
  }

  contactInfo.splice(index, 1);

  res.status(204)
    .end();
});

app.get('/address', (req, res) => {
  res.json(contactInfo);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if(NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;