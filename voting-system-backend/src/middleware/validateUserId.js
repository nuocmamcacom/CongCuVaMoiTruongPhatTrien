const validateUserId = (req, res, next) => {
    const userId = req.params.id;
    
    if (!userId || isNaN(parseInt(userId, 10))) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID. Must be a valid number.'
        });
    }
    
    req.params.id = parseInt(userId, 10);
    next();
};

module.exports = { validateUserId };
