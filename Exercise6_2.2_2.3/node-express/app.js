const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

app.use(express.json());
const filepath = path.join(__dirname, 'db.json');

async function readData() {
    const data = await fs.promises.readFile(filepath, 'utf8');
    return JSON.parse(data);
}

async function writeData(data) {
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
}

// EXERCISE 6.2.2 - ARTICLE ROUTES
// GET all articles
app.get("/articles", async (req, res) => {
    try {
        const data = await readData();
        res.status(200).json({
            message: "Will send all the articles to you!",
            data
        });
    } catch (err) {
        res.status(500).send('Error reading data');
    }
});


//POST a new article
app.post('/articles', async (req, res) => {
    try {
        const db = await readData();
        const newId = db.articles.length > 0 ? db.articles[db.articles.length - 1].id + 1 : 1;
        const newArticle = { id: newId, title: req.body.title, date: req.body.date, text: req.body.text };

        db.articles.push(newArticle);
        await writeData(db);
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//PUT a new article
app.put('/articles', (req, res) => {
    res.status(403).end('PUT operation not supported on /articles');
});

//DELETE all articles
app.delete('/articles', async (req, res) => {
    try {
        const db = await readData();
        db.articles = [];
        await writeData(db);
        res.status(200).end('Deleting all articles');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//GET a specific article
app.get('/articles/:id', async (req, res) => {
    try {
        const db = await readData();
        const article = db.articles.find(a => a.id === parseInt(req.params.id));
        if (!article) return res.status(404).send('Article not found');
        res.status(200).json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST a specific article
app.post('/articles/:id', (req, res) => {
    res.status(403).end('POST operation not supported on /articles/' + req.params.id);
});

//PUT a specific article
app.put('/articles/:id', async (req, res) => {
    try {
        const db = await readData();
        const index = db.articles.findIndex(a => a.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).send('Article not found');

        db.articles[index] = { ...db.articles[index], ...req.body };
        await writeData(db);
        res.status(200).json(db.articles[index]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//DELETE an article
app.delete('/articles/:id', async (req, res) => {
    try {
        const db = await readData();
        const index = db.articles.findIndex(a => a.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).send('Article not found');

        db.articles.splice(index, 1);
        await writeData(db);
        res.status(200).end('Deleting article: ' + req.params.id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// EXERCISE 6.2.3 - VIDEO ROUTES
//GET all videos
app.get('/videos', async (req, res) => {
    try {
        const db = await readData();
        res.status(200).json(db.videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST a new video
app.post('/videos', async (req, res) => {
    try {
        const db = await readData();
        const newId = db.videos.length > 0 ? db.videos[db.videos.length - 1].id + 1 : 1;
        const newVideo = {
            id: newId,
            title: req.body.title,
            author: req.body.author,
            duration: req.body.duration
        };

        db.videos.push(newVideo);
        await writeData(db);
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//PUT a new video
app.put('/videos', (req, res) => {
    res.status(403).end('PUT operation not supported on /videos');
});

//DELETE all videos
app.delete('/videos', async (req, res) => {
    try {
        const db = await readData();
        db.videos = [];
        await writeData(db);
        res.status(200).end('Deleting all videos');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//GET a specific video
app.get('/videos/:id', async (req, res) => {
    try {
        const db = await readData();
        const video = db.videos.find(v => v.id === parseInt(req.params.id));
        if (!video) return res.status(404).send('Video not found');
        res.status(200).json(video);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST a specific video
app.post('/videos/:id', (req, res) => {
    res.status(403).end('POST operation not supported on /videos/' + req.params.id);
});

//PUT a specific video
app.put('/videos/:id', async (req, res) => {
    try {
        const db = await readData();
        const index = db.videos.findIndex(v => v.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).send('Video not found');

        db.videos[index] = { ...db.videos[index], ...req.body };
        await writeData(db);
        res.status(200).json(db.videos[index]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//DELETE a specific video
app.delete('/videos/:id', async (req, res) => {
    try {
        const db = await readData();
        const index = db.videos.findIndex(v => v.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).send('Video not found');

        db.videos.splice(index, 1);
        await writeData(db);
        res.status(200).end('Deleting video: ' + req.params.id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});