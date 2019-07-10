require('express-async-errors');
require('winston-mongodb');
const winston = require('winston');
const config = require('config');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('./startup/routes')(app);

winston.handleExceptions(
  new winston.transports.File({ filename: 'uncaughtExceptions.log' })
)

process.on('unhandledRejection', ex => {
  throw ex;
})

winston.add(winston.transports.File, { filename: 'logfile.log' });
winston.add( winston.transports.MongoDB, { db: 'mongodb://localhost/playground' });

const p = Promise.reject(new Error('Something failed miserably!'));
p.then(() => console.log('Done'));

if(!config.get('jwtPrivateKey')){
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/playground', {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true})
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB..'))



// export PORT=5000 on terminal
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));
