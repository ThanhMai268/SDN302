const express = require('express');
const mongoose = require('mongoose');
const Article = require('../models/article');

const articleRouter = express.Router();

articleRouter.use(express.json());
articleRouter.use(express.urlencoded({ extended: true }));

articleRouter.route('/')
    // GET tất cả bài viết
    .get(async (req, res) => {
        try {
            const articles = await Article.find();
            res.json(articles);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })

    // POST thêm bài viết mới
    .post(async (req, res) => {
        try {
            const newArticle = new Article(req.body);
            await newArticle.save();
            res.status(201).json(newArticle);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    })

    // DELETE xóa toàn bộ bài viết
    .delete(async (req, res) => {
        try {
            await Article.deleteMany({});
            res.status(200).send('All articles deleted successfully.');
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

articleRouter.route('/:id')
    // GET một bài viết cụ thể theo ID
    .get(async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            res.json(article);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })

    // POST trên một ID cụ thể (Không hỗ trợ)
    .post(async (req, res) => {
        res.status(403).end('POST operation not supported on /articles/' + req.params.id);
    })

    // PUT cập nhật bài viết theo ID
    .put(async (req, res) => {
        try {
            const updatedArticle = await Article.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            res.json(updatedArticle);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    })

    // DELETE xóa bài viết theo ID
    .delete(async (req, res) => {
        try {
            await Article.findByIdAndDelete(req.params.id);
            res.status(204).send(); // 204 No Content
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

module.exports = articleRouter;