const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();
require('./startup/config')();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));