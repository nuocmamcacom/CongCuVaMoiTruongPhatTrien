// src/routes/users.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// Import từ controller mới
const userController = require('../controllers/userController');

// Search users route - must be before /:id route
router.get('/search', auth, userController.searchUsers);

// GET all users except current user
router.get('/', auth, userController.getAllUsers);

// PUT update current user's profile
router.put('/profile', auth, userController.updateProfile);

// GET user by ID (Luôn để cuối cùng để tránh conflict route)
router.get('/:id', auth, userController.getUserById);

module.exports = router;