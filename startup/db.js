const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function () {
  mongoose.connect('mongodb://localhost/playground', {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true})
    .then(() => winston.info('Connected to MongoDB...'))
}