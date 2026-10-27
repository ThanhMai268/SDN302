const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.use(authMiddleware);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrderById);
router.delete('/:id', orderController.deleteOrderById);

module.exports = router;
