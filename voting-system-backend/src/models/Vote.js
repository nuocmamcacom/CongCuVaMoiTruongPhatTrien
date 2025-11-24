const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    poll_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    option_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ip_address: {
        type: String,
        maxlength: 45
    }
}, {
    timestamps: {
        createdAt: 'voted_at',
        updatedAt: false
    }
});

// Compound index to prevent duplicate votes
voteSchema.index({ poll_id: 1, user_id: 1, option_id: 1 });
voteSchema.index({ poll_id: 1, user_id: 1 });

module.exports = mongoose.model('Vote', voteSchema);