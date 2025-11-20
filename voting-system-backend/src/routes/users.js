const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateUserId } = require('../middleware/validateUserId');

// GET all users except current user
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('current_user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT user_id, username, email, full_name, created_at
        FROM users
        WHERE user_id != @current_user_id
        ORDER BY username ASC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET user by ID
router.get('/:id', auth, validateUserId, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.params.id)
      .query(`
        SELECT user_id, username, email, full_name, created_at
        FROM users
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update current user's profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, full_name } = req.body;
    const userId = parseInt(req.user.user_id);

    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    const pool = await getPool();

    const existingUser = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('current_user_id', sql.Int, userId)
      .query(`
        SELECT user_id FROM users
        WHERE (username = @username OR email = @email)
        AND user_id != @current_user_id
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('full_name', sql.NVarChar, full_name || null)
      .query(`
        UPDATE users
        SET username = @username,
            email = @email,
            full_name = @full_name,
            updated_at = GETDATE()
        WHERE user_id = @user_id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET search users by keyword
const searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        console.log('Search term received:', searchTerm); // Log để debug

        // Validate search term
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search term is required and must be a non-empty string'
            });
        }

        const currentUserId = req.user?.user_id; // Đảm bảo req.user tồn tại
        if (!currentUserId || isNaN(parseInt(currentUserId, 10))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid current user ID'
            });
        }

        const pool = await getPool();
        // Trong hàm searchUsers, thêm log:
        console.log('URL yêu cầu:', url);
        console.log('Headers:', headers);
        console.log('Dữ liệu gửi:', requestBody);
        console.log('Pool status for search:', pool ? 'valid' : 'invalid');

        if (!pool) {
            throw new Error('Database connection failed');
        }

        const result = await pool.request()
            .input('search_term', sql.NVarChar, `%${searchTerm.trim()}%`)
            .input('current_user_id', sql.Int, parseInt(currentUserId, 10))
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
router.get('/search', auth, searchUsers);

module.exports = router;
