const validateObjectId = require('../middleware/validateObjectId');
const validateMid = require('../middleware/validate');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Genre, validate} = require('../models/genre');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async(req, res) => {
const genres = await Genre.find().sort('name');
  res.send(genres);
});

router.get('/:id', validateObjectId, async(req, res) => {
const genre = await Genre.findById(req.params.id);

if(!genre) return res.status(404).send('The genre with given ID was not found');

res.send(genre);
});

router.post('/', [auth, validateMid(validate)], async(req,res) => {
  const genre = new Genre({ name: req.body.name });
  await genre.save();
  res.send(genre);
})

router.put('/:id', [auth, validateObjectId, validateMid(validate)], async(req,res) => {
  const genre = await Genre.findByIdAndUpdate(
    req.params.id, 
    { name: req.body.name},
    { new : true }
  )
  if(!genre) return res.status(404).send('The genre with given ID was not found');

  res.send(genre);
})

router.delete('/:id', [auth, admin, validateObjectId], async(req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if(!genre) return res.status(404).send('The genre with given ID was not found');

  res.send(genre);
})

module.exports = router;