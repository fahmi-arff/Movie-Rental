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

//  /2018/1 in input
app.get('/api/posts/:year/:month', (req, res) => {
  res.send(req.params);
});

// export PORT=5000 on terminal
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));
