const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { searchUsers, getUserById } = require('../controllers/authController');
const User = require('../models/User');

// Search users route - must be before /:id route to avoid conflicts
router.get('/search', auth, searchUsers);

// GET all users except current user
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.user_id }
    })
    .select('_id username email full_name createdAt')
    .sort({ username: 1 });

    // Transform to match frontend expectations
    const formattedUsers = users.map(user => ({
      user_id: user._id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      created_at: user.createdAt
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET user by ID
router.get('/:id', auth, getUserById);

// PUT update current user's profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { username, email, full_name } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    // Check if username or email already exists for other users
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, full_name },
      { new: true, runValidators: true }
    ).select('_id username email full_name');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: {
        user_id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
