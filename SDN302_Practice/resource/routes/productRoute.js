const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

router.use(authMiddleware);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProductById);
router.delete('/:id', productController.deleteProductById);

module.exports = router;
