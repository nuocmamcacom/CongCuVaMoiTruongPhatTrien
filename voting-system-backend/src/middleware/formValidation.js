const Joi = require('joi');

const questionSchema = Joi.object({
    question_id: Joi.string().optional(),
    question_text: Joi.string().required().trim().max(500),
    question_type: Joi.string().required().valid('short_text', 'paragraph', 'multiple_choice', 'checkbox', 'rating'),
    options: Joi.array().items(Joi.object({
        option_id: Joi.string().optional(),
        option_text: Joi.string().required().trim()
    })).when('question_type', {
        is: Joi.valid('multiple_choice', 'checkbox'),
        then: Joi.array().required().min(1),
        otherwise: Joi.optional()
    }),
    is_required: Joi.boolean().default(false),
    rating_scale: Joi.object({
        min: Joi.number().integer().default(1),
        max: Joi.number().integer().default(5)
    }).optional(),
    order_index: Joi.number().integer().optional()
});

const createFormSchema = Joi.object({
    title: Joi.string().required().trim().max(200),
    description: Joi.string().optional().trim().max(1000),
    questions: Joi.array().items(questionSchema).required().min(1)
});

const answerSchema = Joi.object({
    question_id: Joi.string().required(),
    question_type: Joi.string().required().valid('short_text', 'paragraph', 'multiple_choice', 'checkbox', 'rating'),
    answer_text: Joi.string().optional().trim().max(5000),
    selected_options: Joi.array().items(Joi.string()).optional(),
    rating_value: Joi.number().integer().min(1).max(10).optional()
});

const submitResponseSchema = Joi.object({
    answers: Joi.array().items(answerSchema).required().min(1)
});

const validateCreateForm = (req, res, next) => {
    const { error } = createFormSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateSubmitResponse = (req, res, next) => {
    const { error } = submitResponseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateCreateForm,
    validateSubmitResponse
};