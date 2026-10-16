const express = require('express');
const articleController = require('../controllers/articleController');

const articleRouter = express.Router();

articleRouter.use(express.json());
articleRouter.use(express.urlencoded({ extended: true }));

articleRouter.route('/')
    .get(articleController.findAll)
    .post(articleController.create)
    .put((req, res) => {
        res.status(403).json('PUT operation not supported on /articles');
    })
    .delete(articleController.delete);

articleRouter.route('/:id')
    .get(articleController.findById)
    .post((req, res) => {
        res.status(403).end('POST operation not supported on /articles/' + req.params.id);
    })
    .put(articleController.update)
    .delete(articleController.delete);

module.exports = articleRouter;