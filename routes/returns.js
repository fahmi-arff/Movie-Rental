const {Rental} = require('../models/rental');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/', auth, async(req, res) => {
  if(!req.body.customerId) return res.status(400).send('customerId is not provided')
  if(!req.body.movieId) return res.status(400).send('movieId is not provided')
  
  const rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  })
  if (!rental) return res.status(404).send('Rental not found.')

  if(rental.dateReturned) return res.status(400).send('Return already processed.')

  return res.status(200).send();
});

module.exports = router;