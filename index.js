const express = require('express');
// Create Express application by convenction call app
const app = express();

// callback as route handler
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
  res.send([1,2,3]);
});

app.listen(3000, () => console.log('Listening on port 3000...'));
