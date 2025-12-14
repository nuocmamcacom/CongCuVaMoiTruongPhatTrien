const Joi = require('joi');

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        full_name: Joi.string().min(2).max(100).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateCreatePoll = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().max(1000).allow(''),
        poll_type: Joi.string().valid('single', 'multiple').default('single'),
        is_anonymous: Joi.boolean().default(false),
        start_time: Joi.date().iso().allow(null),
        end_time: Joi.date().iso().greater(Joi.ref('start_time')).allow(null),
        options: Joi.array().items(Joi.string().min(1).max(500)).min(2).max(10).required(),
        participants: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateVote = (req, res, next) => {
    const schema = Joi.object({
        poll_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        option_id: Joi.alternatives().try(
            Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
            Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
        ).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateCreatePoll,
    validateVote
};