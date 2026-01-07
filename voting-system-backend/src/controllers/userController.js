// src/controllers/userController.js
const User = require('../models/User');

class UserController {
    // 1. Logic lấy tất cả user (trừ bản thân) - Chuyển từ router.get('/')
    getAllUsers = async (req, res) => {
        try {
            const users = await User.find({
                _id: { $ne: req.user.user_id }
            })
            .select('_id username email full_name createdAt')
            .sort({ username: 1 });

            // Transform data
            const formattedUsers = users.map(user => ({
                user_id: user._id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                created_at: user.createdAt
            }));

            res.json({ success: true, data: formattedUsers });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    // 2. Logic update profile - Chuyển từ router.put('/profile')
    updateProfile = async (req, res) => {
        try {
            const userId = req.user.user_id;
            const { username, email, full_name } = req.body;

            if (!username || !email) {
                return res.status(400).json({ success: false, message: 'Username and email are required' });
            }

            // Check trùng lặp với user khác
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
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    // 3. Logic Search Users - Chuyển từ authController sang cho đúng chỗ
    searchUsers = async (req, res) => {
        try {
            const searchTerm = req.query.q;
            const currentUserId = req.user.user_id;

            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const users = await User.find({
                _id: { $ne: currentUserId },
                $or: [
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { full_name: { $regex: searchTerm, $options: 'i' } }
                ]
            })
            .select('_id username email full_name')
            .sort({ username: 1 })
            .limit(20);

            const formattedUsers = users.map(user => ({
                user_id: user._id,
                username: user.username,
                email: user.email,
                full_name: user.full_name
            }));

            res.json({
                success: true,
                data: formattedUsers
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };

    // 4. Logic Get User By ID - Chuyển từ authController sang cho đúng chỗ
    getUserById = async (req, res) => {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId)
                .select('_id username email full_name');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    user_id: user._id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };
}

module.exports = new UserController();
