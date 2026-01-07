const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    question_id: {
        type: String,
        required: true
    },
    question_type: {
        type: String,
        required: true,
        enum: ['short_text', 'paragraph', 'multiple_choice', 'checkbox', 'rating']
    },
    answer_text: String, // For short_text, paragraph
    selected_options: [String], // For multiple_choice, checkbox (option_ids)
    rating_value: Number // For rating
}, { _id: false });

const formResponseSchema = new mongoose.Schema({
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormTemplate',
        required: true
    },
    answers: [answerSchema],
    submitter_ip: String,
    submitter_user_agent: String,
    submitted_at: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
formResponseSchema.index({ form_id: 1, submitted_at: -1 });

module.exports = mongoose.model('FormResponse', formResponseSchema);