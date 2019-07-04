// what we return is class so have to prefix capital
const Joi = require('@hapi/joi');
const express = require('express');
// Create Express application by convenction call app
const app = express();

//weird undefined code
app.use(express.json());

const courses = [
  { id: 1 , name: 'course1' },
  { id: 2 , name: 'course2' },
  { id: 3 , name: 'course3' }
]

// callback as route handler
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
  res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
  // need to parseInt because id is return object
  const course = courses.find(c => c.id === parseInt(req.params.id));
  // if course not found return 404
  if(!course) return res.status(404).send('The course with given ID was not found');
  res.send(course);
});

app.post('/api/courses', (req,res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };
  courses.push(course);
  res.send(course);
})

app.put('/api/courses/:id', (req,res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The course with given ID was not found');

  // const result = validateCourse(req.body); non destructive
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  course.name = req.body.name;
  res.send(course);
})

app.delete('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The course with given ID was not found');

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
})

function validateCourse(course){
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(course, schema);
}

// export PORT=5000 on terminal
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));
