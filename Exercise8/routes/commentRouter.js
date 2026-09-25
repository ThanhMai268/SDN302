const express = require ('express');
const commentRouter = express.Router();
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

commentRouter.route('/')
    .get(async (req, res, next) => {
        try {
            const data = await readData();
            res.status(200).json({
                message: "OK",
                comments: data.comments
            });
        } catch (err) {
            next(err);
        }
    })

    .post(async (req, res, next) => {
        try {
            const data = await readData();
            const articleId = Number (req.body.articleId);
            const newId = data.comments.length > 0 ? data.comments[data.comments.length - 1].id + 1 : 1;
            const newComment = {
                id: newId, 
                articleId: req.body.articleId,
                author: req.body.author,
                content: req.body.content,
                date: req.body.date
            };
            const article = data.articles.find(a => a.id === articleId);
            if (!article) {
                throw new Error('Article does not exist');
            }
            data.comments.push(newComment);
            await writeData(data);
            res.status(201).json({
                message: 'Created',
                comments: newComment
            });
        } catch (err) {
            next(err);
        }
    })

    .put(async (req, res) => {
        res.status(403).end('PUT operation not supported on /comments')
    });

commentRouter.route('/:id') 
    .get(async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number(req.params.id);
            const comment = data.comments.find(a => a.id === Id);
            if (!comment) {
                throw new Error(`Comment ${Id} not found`);
            }
            res.status(200).json(comment);
        } catch (err) {
            next(err);
        }
    })

    .post(async (req, res) => {
        res.status(403).end('POST operation not supported on /comments/' + req.params.id);
    })

    .put (async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.comments.findIndex(a => a.id === Id);
            if (index === -1) {
                throw new Error(`Comments ${Id} not found`);
            }
            data.comments[index] = {
                ...data.comments[index],
                articleId: req.body.articleId,
                author: req.body.author,
                content: req.body.content,
                date: req.body.date
            }
            await writeData(data);
            res.status(200).end('OK');
        } catch (err) {
            next(err);
        }
    })

    .delete(async (req, res, next) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.comments.findIndex(a => a.id === Id);
            if (index == -1) {
                throw new Error(`Comment ${Id} not found`);
            }
            // ở vị trí index xóa 1 phần tử
            data.comments.splice(index, 1); 
            await writeData(data); 
            res.status(200).end('Deleting comment: ' + req.params.id);
        } catch (err) {
            next(err);
        }
    })

module.exports = commentRouter;