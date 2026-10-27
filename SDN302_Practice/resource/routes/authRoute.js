const router = require('express').Router();
const { createToken } = require('../controllers/authController');

router.post('/tokens', createToken);

module.exports = router;
