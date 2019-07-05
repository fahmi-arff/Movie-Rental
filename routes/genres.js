const Joi = require('@hapi/joi');
const express = require('express');
const router = express.Router();

const genres = [
  { id: 1 , name: 'action' },
  { id: 2 , name: 'horror' },
  { id: 3 , name: 'comedy' }
]

router.get('/', (req, res) => {
  res.send(genres);
});

router.get('/:id', (req, res) => {
  // need to parseInt because id is return object
  const course = genres.find(c => c.id === parseInt(req.params.id));
  // if course not found return 404
  if(!course) return res.status(404).send('The genres with given ID was not found');
  res.send(course);
});

router.post('/', (req,res) => {
  const { error } = validateGenres(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = {
    id: genres.length + 1,
    name: req.body.name
  };
  genres.push(genre);
  res.send(genre);
})

router.put('/:id', (req,res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if(!genre) return res.status(404).send('The course with given ID was not found');

  // const result = validateCourse(req.body); non destructive
  const { error } = validateGenres(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genre.name = req.body.name;
  res.send(genre);
})

router.delete('/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if(!genre) return res.status(404).send('The course with given ID was not found');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  res.send(genre);
})

function validateGenres(genre){
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

module.exports = router;