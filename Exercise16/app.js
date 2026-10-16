const express = require('express');
const mongoose = require('mongoose');
const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/Exercise')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});