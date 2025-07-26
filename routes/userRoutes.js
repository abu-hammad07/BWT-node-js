const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware')
const { createUserValidator } = require('../middlewares/userMiddleware');

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUser);
router.post('/', createUserValidator, UserController.updateProfile);

// Protected Routes
router.get('/profile', verifyToken, UserController.getProfile);
router.post('/profile/update', verifyToken, UserController.updateProfile);


module.exports = router;


