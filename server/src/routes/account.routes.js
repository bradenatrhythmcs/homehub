const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const Account = require('../models/account');
const AppError = require('../utils/AppError');

// All routes require authentication
router.use(authMiddleware);

// Get categories (accessible to all parent users)
router.get('/categories', async (req, res, next) => {
    try {
        if (req.user.account_type !== 'PARENT') {
            throw new AppError('Only parent accounts can access categories', 403);
        }
        const categories = await Account.getCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// Get all accounts
router.get('/', async (req, res, next) => {
    try {
        const accounts = await Account.findAll(req.user.id);
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

// Get a specific account
router.get('/:id', async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            throw new AppError('Account not found', 404);
        }
        res.json(account);
    } catch (error) {
        next(error);
    }
});

// Create a new account
router.post('/', async (req, res, next) => {
    try {
        if (req.user.account_type !== 'PARENT') {
            throw new AppError('Only parent accounts can create accounts', 403);
        }

        const { title, category_id, owner_id, account_number, company_name, note, password_id, bill_id } = req.body;

        // Validate required fields
        if (!title || !category_id || !owner_id || !company_name) {
            throw new AppError('Missing required fields', 400);
        }

        const result = await Account.create({
            title,
            categoryId: category_id,
            ownerId: owner_id,
            accountNumber: account_number || null,
            companyName: company_name,
            note: note || '',
            passwordId: password_id || null,
            billId: bill_id || null,
            createdBy: req.user.id
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update an account
router.put('/:id', async (req, res, next) => {
    try {
        const { title, category_id, owner_id, account_number, company_name, note, password_id, bill_id } = req.body;

        // Validate required fields
        if (!title || !category_id || !owner_id || !company_name) {
            throw new AppError('Missing required fields', 400);
        }

        const result = await Account.update(req.params.id, req.user.id, {
            title,
            categoryId: category_id,
            ownerId: owner_id,
            accountNumber: account_number || null,
            companyName: company_name,
            note: note || '',
            passwordId: password_id || null,
            billId: bill_id || null
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete an account
router.delete('/:id', async (req, res, next) => {
    try {
        await Account.delete(req.params.id, req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 