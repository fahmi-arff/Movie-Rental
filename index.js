const config = require('config');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();

if(!config.get('jwtPrivateKey')){
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));
