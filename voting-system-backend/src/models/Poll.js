const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
    option_text: {
        type: String,
        required: true,
        trim: true
    },
    option_order: {
        type: Number,
        required: true
    },
    vote_count: {
        type: Number,
        default: 0
    }
}, { _id: true });

const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    poll_type: {
        type: String,
        enum: ['single', 'multiple'],
        default: 'single'
    },
    is_anonymous: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: {
        type: Date
    },
    options: [pollOptionSchema],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    total_votes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
pollSchema.index({ creator_id: 1, created_at: -1 });
pollSchema.index({ participants: 1 });
pollSchema.index({ is_active: 1 });

module.exports = mongoose.model('Poll', pollSchema);