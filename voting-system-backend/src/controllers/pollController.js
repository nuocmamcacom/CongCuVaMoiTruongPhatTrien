const { getPool, sql } = require('../config/database');
const { broadcastPollUpdate } = require('../services/socketService');

const createPoll = async (req, res) => {
    try {
        const { title, description, poll_type, is_anonymous, start_time, end_time, options, participants } = req.body;
        const creator_id = req.user.user_id;

        if (!title || !options || options.length < 2) {
            return res.status(400).json({ message: 'Title and at least 2 options are required' });
        }

        const pool = await getPool();
        
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description || '')
            .input('creator_id', sql.Int, creator_id)
            .input('poll_type', sql.NVarChar, poll_type || 'single')
            .input('is_anonymous', sql.Bit, is_anonymous || 0)
            .input('start_time', sql.DateTime2, start_time || null)
            .input('end_time', sql.DateTime2, end_time || null)
            .input('options', sql.NVarChar, JSON.stringify(options))
            .input('participants', sql.NVarChar, JSON.stringify(participants || []))
            .execute('sp_CreatePoll');

        const poll_id = result.recordset[0]?.poll_id;
        if (!poll_id || isNaN(poll_id)) {
            throw new Error('Invalid poll_id returned from database');
        }

        console.log('Created poll with poll_id:', poll_id); // Log poll_id
        res.status(201).json({
            message: 'Poll created successfully',
            poll_id: poll_id
        });

    } catch (error) {
        console.error('Create poll error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPolls = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('user_id', sql.Int, req.user.user_id)
            .query(`
                SELECT DISTINCT 
                    p.poll_id, p.title, p.description, p.poll_type, p.is_anonymous,
                    p.is_active, p.start_time, p.end_time, p.created_at,
                    u.full_name as creator_name,
                    CASE WHEN p.creator_id = @user_id THEN 1 ELSE 0 END as is_creator
                FROM Polls p
                INNER JOIN Users u ON p.creator_id = u.user_id
                LEFT JOIN PollParticipants pp ON p.poll_id = pp.poll_id
                WHERE p.creator_id = @user_id OR pp.user_id = @user_id
                ORDER BY p.created_at DESC
            `);

        console.log('Polls fetched:', result.recordset.map(p => p.poll_id)); // Log poll_id
        res.json(result.recordset || []); // Trả về mảng rỗng nếu không có dữ liệu
    } catch (error) {
        console.error('Get polls error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPollDetails = async (req, res) => {
    try {
        const { poll_id } = req.params;
        const user_id = req.user.user_id;

        console.log('getPollDetails called with poll_id:', poll_id); // Thêm log

        const pool = await getPool();
        
        // Kiểm tra quyền truy cập
        const accessCheck = await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT 1 FROM Polls p
                LEFT JOIN PollParticipants pp ON p.poll_id = pp.poll_id
                WHERE p.poll_id = @poll_id AND (p.creator_id = @user_id OR pp.user_id = @user_id)
            `);

        if (accessCheck.recordset.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Lấy thông tin poll
        const pollResult = await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .query(`
                SELECT p.*, u.full_name as creator_name
                FROM Polls p
                INNER JOIN Users u ON p.creator_id = u.user_id
                WHERE p.poll_id = @poll_id
            `);

        // Lấy options
        const optionsResult = await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .query(`
                SELECT po.*, ISNULL(vr.vote_count, 0) as vote_count, ISNULL(vr.percentage, 0) as percentage
                FROM PollOptions po
                LEFT JOIN VoteResults vr ON po.option_id = vr.option_id
                WHERE po.poll_id = @poll_id
                ORDER BY po.option_order
            `);

        // Kiểm tra đã vote chưa
        const userVoteResult = await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .input('user_id', sql.Int, user_id)
            .query('SELECT option_id FROM Votes WHERE poll_id = @poll_id AND user_id = @user_id');

        res.json({
            poll: pollResult.recordset[0],
            options: optionsResult.recordset,
            user_votes: userVoteResult.recordset.map(v => v.option_id),
            can_vote: pollResult.recordset[0].is_active && 
                     (!pollResult.recordset[0].end_time || new Date() < new Date(pollResult.recordset[0].end_time))
        });

    } catch (error) {
        console.error('Get poll details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const castVote = async (req, res) => {
    try {
        const { poll_id, option_id } = req.body;
        const user_id = req.user.user_id;
        const ip_address = req.ip;

        const pool = await getPool();
        
        await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .input('user_id', sql.Int, user_id)
            .input('option_id', sql.Int, option_id)
            .input('ip_address', sql.NVarChar, ip_address)
            .execute('sp_CastVote');

        // Lấy kết quả mới nhất để broadcast
        const resultsResult = await pool.request()
            .input('poll_id', sql.Int, poll_id)
            .query(`
                SELECT po.option_id, po.option_text, vr.vote_count, vr.percentage
                FROM PollOptions po
                LEFT JOIN VoteResults vr ON po.option_id = vr.option_id
                WHERE po.poll_id = @poll_id
                ORDER BY po.option_order
            `);

        // Broadcast cập nhật realtime
        broadcastPollUpdate(poll_id, resultsResult.recordset);

        res.json({
            message: 'Vote cast successfully',
            results: resultsResult.recordset
        });

    } catch (error) {
        console.error('Cast vote error:', error);
        if (error.number >= 50001 && error.number <= 50003) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = {
    createPoll,
    getPolls,
    getPollDetails,
    castVote
};