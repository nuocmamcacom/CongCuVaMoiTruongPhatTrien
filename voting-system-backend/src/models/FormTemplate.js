const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question_id: {
        type: String,
        required: true
    },
    question_text: {
        type: String,
        required: true,
        trim: true
    },
    question_type: {
        type: String,
        required: true,
        enum: ['short_text', 'paragraph', 'multiple_choice', 'checkbox', 'rating']
    },
    options: [{
        option_id: String,
        option_text: String
    }], // For multiple_choice and checkbox
    is_required: {
        type: Boolean,
        default: false
    },
    rating_scale: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 5 }
    }, // For rating type
    order_index: {
        type: Number,
        required: true
    }
}, { _id: false });

const formTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        trim: true,
        maxLength: 1000
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [questionSchema],
    is_active: {
        type: Boolean,
        default: true
    },
    submission_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update the updated_at field before saving
formTemplateSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('FormTemplate', formTemplateSchema);