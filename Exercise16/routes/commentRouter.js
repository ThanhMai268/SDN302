const express = require('express');
const Comment = require('../models/comment');

const commentRouter = express.Router();
commentRouter.use(express.json());

commentRouter.route('/')
    .get(async (req, res) => {
        try {
            // Sử dụng populate để lấy chi tiết bài viết thay vì chỉ lấy ID
            const comments = await Comment.find().populate('article');
            res.json(comments);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    // POST a new comment
    .post(async (req, res) => {
        try {
            const comment = new Comment(req.body);
            await comment.save();
            res.status(201).json(comment);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

module.exports = commentRouter;