const express = require('express');
const app = express();
const courses = require('./routes/courses');

app.use(express.json());
app.use('/api/courses', courses);

// export PORT=5000 on terminal
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port} ...`));
