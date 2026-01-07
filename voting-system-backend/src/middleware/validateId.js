const mongoose = require('mongoose');

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const validateUserId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }
    next();
};

const validatePollId = (req, res, next) => {
    if (!isValidObjectId(req.params.poll_id)) {
        return res.status(400).json({ success: false, message: 'Invalid poll ID format.' });
    }
    next();
};

module.exports = { 
    validateUserId,
    validatePollId
};