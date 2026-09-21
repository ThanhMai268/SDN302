const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

app.use(express.json());

const articleRouter = require('./routes/articleRouter');
const videoRouter = require('./routes/videoRouter');

app.use('/articles', articleRouter);
app.use('/videos', videoRouter);

app.get('/', (req, res) => {
    res.status(200).json({message: "User res api is working"});
})

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});