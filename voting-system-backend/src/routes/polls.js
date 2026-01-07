const express = require('express');
const pollController = require('../controllers/pollController');
const { auth } = require('../middleware/auth');
const { validateCreatePoll, validateVote } = require('../middleware/pollValidation');
const { validatePollId } = require('../middleware/validateId');
const { checkCreator } = require('../middleware/checkCreator');

const router = express.Router();

// Tất cả routes cần authentication
router.use(auth);

router.post('/', validateCreatePoll, pollController.createPoll);
router.get('/', pollController.getPolls);
router.get('/:poll_id', validatePollId, pollController.getPollDetails);
router.post('/vote', validateVote, pollController.castVote);

// Export Excel - requires creator permission
router.get('/:poll_id/export', validatePollId, checkCreator, pollController.exportPollToExcel);

module.exports = router;
