const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password_hash: hashedPassword,
            full_name,
            role: 'user',
            is_active: true
        });

        await newUser.save();

        // Generate JWT token (auto-login after registration)
        const token = jwt.sign(
            {
                user_id: newUser._id,
                username: newUser.username,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                user_id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({
            username,
            is_active: true
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user._id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const currentUserId = req.user.user_id;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        // Use text search or regex
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

        // Transform to match frontend expectations
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

const getUserById = async (req, res) => {
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

module.exports = { register, login, getUserById, searchUsers };

