const { AppError } = require('./error.middleware');
const User = require('../models/user');

const parentRequired = (req, res, next) => {
    if (req.user.account_type !== 'PARENT') {
        throw new AppError('Parent account required for this action', 403);
    }
    next();
};

const parentOrAdminRequired = (req, res, next) => {
    if (req.user.account_type !== 'PARENT' && !req.user.is_admin) {
        throw new AppError('Parent or admin account required for this action', 403);
    }
    next();
};

module.exports = { parentRequired, parentOrAdminRequired }; 