const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.get('/', (req, res) => {
    res.status(200).json({message: "User res api is working"});
})

// Error-handling middleware phải được đặt ở cuối cùng
app.use((err, req, res, next) => {
    console.error(err.stack); // Log lỗi ra console để dễ debug
    res.status(500).json({ error: err.message || "An error occurred, please try again later." });
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});