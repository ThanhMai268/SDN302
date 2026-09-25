const express = require ('express');
const articleRouter = express.Router();
const fs = require('fs');
const path = require ('path');

const filepath = path.join(__dirname, '../data.json');

async function readData() {
    try{
        const data = await fs.promises.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {articles:[], comments: []};
    }
};

async function writeData(data) {
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
};

function validateArticle(body) {
    if (!body) return false;
	return typeof body.title === "string" && body.title.trim() !== ""
		&& typeof body.content === "string" && body.content.trim() !== ""
        && typeof body.author === "string" && body.author.trim() !== ""
        && typeof body.date === "string" && body.date.trim() !== "";
}

articleRouter.route('/')
    .get(async (req, res, next) => {
        try {
            const data = await readData();
            res.status(200).json({
                articles: data.articles
            });
        } catch (err) {
            next(err);
        }
    })

    .post(async (req, res, next) => {
        try {
            if (!validateArticle(req.body)) {
                throw new Error("Missing required article fields");
            }
            const data = await readData();
            const newId = data.articles.length > 0 ? data.articles[data.articles.length - 1].id + 1 : 1;
            const newArticle = {
                id: newId, 
                title: req.body.title, 
                content: req.body.content, 
                author: req.body.author,
                date: req.body.date
            };
            data.articles.push(newArticle);
            await writeData(data);
            res.status(201).json({
                message: 'Created',
                articles: newArticle
            });
        } catch (err) {
            next(err);
        }
    })

    .put(async (req, res) => {
        res.status(403).end('PUT operation not supported on /articles')
    });

articleRouter.route('/:id') 
    .get(async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number(req.params.id);
            const article = data.articles.find(a => a.id === Id);
            if (!article) {
                throw new Error(`Article ${Id} not found`);
            }
            res.status(200).json(article);
        } catch (err) {
            next(err);
        }
    })

    .post(async (req, res) => {
        res.status(403).end('POST operation not supported on /articles/' + req.params.id);
    })

    .put (async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.articles.findIndex(a => a.id === Id);
            if (index === -1) {
                throw new Error(`Article ${Id} not found`);
            }
            data.articles[index] = {
                ...data.articles[index],
                title: req.body.title, 
                content: req.body.content, 
                author: req.body.author,
                date: req.body.date
            }
            await writeData(data);
            res.status(201).json(data.articles[index]);
        } catch (err) {
            next(err);
        }
    })

    .delete(async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.articles.findIndex(a => a.id === Id);
            if (index === -1) {
                throw new Error(`Article ${Id} not found`);
            }
            // ở vị trí index xóa 1 phần tử
            data.articles.splice(index, 1); 
            await writeData(data); 
            res.status(200).end('OK ' + req.params.id);
        } catch (err) {
            next(err);
        }
    })

module.exports = articleRouter;