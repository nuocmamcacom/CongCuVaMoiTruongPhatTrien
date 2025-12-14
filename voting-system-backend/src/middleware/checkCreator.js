const Poll = require('../models/Poll');

const checkCreator = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const userId = req.user.user_id;

        // Find the poll
        const poll = await Poll.findById(pollId);
        
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        // Check if the current user is the creator of the poll
        if (poll.creator_id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only poll creator can perform this action.'
            });
        }

        // Add poll to request object for use in next middleware/controller
        req.poll = poll;
        next();
    } catch (error) {
        console.error('Check creator middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { checkCreator };