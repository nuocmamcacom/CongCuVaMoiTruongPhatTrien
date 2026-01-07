const express = require('express');
const { register, login, googleAuth, googleCallback } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/authValidation');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;