const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { checkLoginValidator, verifyToken } = require('../middlewares/authMiddleware');

router.post('/login', checkLoginValidator, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/dashboard', verifyToken, AuthController.getDashboard);

module.exports = router;
