const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, connect, sql } = require('../config/database');



const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    const pool = await getPool();

    // Băm mật khẩu trước khi insert
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool
      .request()
      .input('username', sql.NVarChar(50), username)
      .input('email', sql.NVarChar(100), email)
      .input('password_hash', sql.NVarChar(255), hashedPassword)
      .input('full_name', sql.NVarChar(100), full_name)
      .input('role', sql.NVarChar(20), 'user')
      .input('is_active', sql.Bit, true)
      .input('created_at', sql.DateTime2, new Date())
      .input('updated_at', sql.DateTime2, new Date())
      .query(`
        INSERT INTO Users (
          username, email, password_hash, full_name, role, is_active, created_at, updated_at
        ) VALUES (
          @username, @email, @password_hash, @full_name, @role, @is_active, @created_at, @updated_at
        );

        SELECT * FROM Users WHERE email = @email
      `);

    const newUser = result.recordset[0];

    res.status(201).json({
      success: true,
      data: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const pool = await getPool();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username AND is_active = 1');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const currentUserId = req.user.user_id;
        
        console.log('Search term:', searchTerm);
        console.log('Current user ID:', currentUserId);

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }
        
        const pool = await getPool();
        console.log('Pool status for search:', pool ? 'valid' : 'invalid');

        const result = await pool.request()
            .input('search_term', sql.NVarChar, `%${searchTerm}%`)
            .input('current_user_id', sql.Int, currentUserId)
            .query(`
                SELECT user_id, username, email, full_name 
                FROM Users 
                WHERE user_id != @current_user_id
                AND (
                    username LIKE @search_term 
                    OR email LIKE @search_term 
                    OR full_name LIKE @search_term
                )
                ORDER BY username ASC
            `);
        
        console.log('Search results:', result.recordset);
        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const userIdParam = req.params.id;
        console.log('Raw requested userId:', userIdParam); // Log giá trị thô

        // Kiểm tra và parse userId
        if (!userIdParam || typeof userIdParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID. Must be a valid number.'
            });
        }

        const parsedUserId = parseInt(userIdParam, 10);
        if (isNaN(parsedUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID. Must be a number.'
            });
        }

        const pool = await getPool();
        console.log('Pool status for getUserById:', pool ? 'valid' : 'invalid');

        if (!pool) {
            throw new Error('Database connection failed');
        }

        const result = await pool.request()
            .input('user_id', sql.Int, parsedUserId)
            .query(`
                SELECT user_id, username, email, full_name 
                FROM Users 
                WHERE user_id = @user_id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

module.exports = { register, login, getUserById, searchUsers, connect, sql };

