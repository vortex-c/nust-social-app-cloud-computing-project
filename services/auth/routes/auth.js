const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/verify', authMiddleware, authController.verifyToken);

router.get('/user/:id', authController.getUserById);
router.post('/users/batch', authController.getUsersBatch);

module.exports = router;