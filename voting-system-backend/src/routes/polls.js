const express = require('express');
const { 
    createPoll, 
    getPolls, 
    getPollDetails, 
    castVote 
} = require('../controllers/pollController');
const { auth } = require('../middleware/auth');
const { validateCreatePoll, validateVote } = require('../middleware/validation');

const router = express.Router();

// Middleware để validate poll_id
const validatePollId = (req, res, next) => {
    const { poll_id } = req.params;
    if (!poll_id || isNaN(poll_id)) {
        return res.status(400).json({ message: 'Invalid poll_id. Must be a number.' });
    }
    next();
};

// Tất cả routes cần authentication
router.use(auth);

router.post('/', validateCreatePoll, createPoll);
router.get('/', getPolls);
router.get('/:poll_id', validatePollId, getPollDetails);
router.post('/vote', validateVote, castVote);

module.exports = router;