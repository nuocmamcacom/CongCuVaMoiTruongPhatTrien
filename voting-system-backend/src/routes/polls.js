const express = require('express');
const { 
    createPoll, 
    getPolls, 
    getPollDetails, 
    castVote,
    exportPollToExcel 
} = require('../controllers/pollController');
const { auth } = require('../middleware/auth');
const { validateCreatePoll, validateVote } = require('../middleware/validation');
const { checkCreator } = require('../middleware/checkCreator');

const router = express.Router();

// Middleware để validate poll_id
const validatePollId = (req, res, next) => {
    const { poll_id } = req.params;
    if (!poll_id || typeof poll_id !== 'string' || poll_id.length !== 24) {
        return res.status(400).json({ message: 'Invalid poll_id. Must be a valid ObjectId.' });
    }
    next();
};

// Tất cả routes cần authentication
router.use(auth);

router.post('/', validateCreatePoll, createPoll);
router.get('/', getPolls);
router.get('/:poll_id', validatePollId, getPollDetails);
router.post('/vote', validateVote, castVote);

// Export Excel - requires creator permission
router.get('/:poll_id/export', validatePollId, checkCreator, exportPollToExcel);

module.exports = router;