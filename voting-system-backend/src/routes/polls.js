const express = require('express');
const { 
    createPoll, 
    getPolls, 
    getPollDetails, 
    castVote,
    exportPollToExcel 
} = require('../controllers/pollController');
const { auth } = require('../middleware/auth');
const { validateCreatePoll, validateVote } = require('../middleware/pollValidation');
const { validatePollId } = require('../middleware/validateId');
const { checkCreator } = require('../middleware/checkCreator');

const router = express.Router();

// Tất cả routes cần authentication
router.use(auth);

router.post('/', validateCreatePoll, createPoll);
router.get('/', getPolls);
router.get('/:poll_id', validatePollId, getPollDetails);
router.post('/vote', validateVote, castVote);

// Export Excel - requires creator permission
router.get('/:poll_id/export', validatePollId, checkCreator, exportPollToExcel);

module.exports = router;