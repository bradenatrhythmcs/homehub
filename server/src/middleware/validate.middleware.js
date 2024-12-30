const { validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Format errors for response
            const formattedErrors = errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.param && error.param.includes('password') ? '********' : error.value
            }));

            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: formattedErrors
            });
        }

        next();
    };
};

module.exports = validate; 