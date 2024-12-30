const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const Bill = require('../models/bill');
const AppError = require('../utils/AppError');

// All routes require authentication
router.use(authMiddleware);

// Get categories (accessible to all parent users)
router.get('/categories', async (req, res, next) => {
    try {
        if (req.user.account_type !== 'PARENT') {
            throw new AppError('Only parent accounts can access categories', 403);
        }
        const categories = await Bill.getCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// Get all bills
router.get('/', async (req, res, next) => {
    try {
        const bills = await Bill.findAll(req.user.id);
        res.json(bills);
    } catch (error) {
        next(error);
    }
});

// Get a specific bill
router.get('/:id', async (req, res, next) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            throw new AppError('Bill not found', 404);
        }
        res.json(bill);
    } catch (error) {
        next(error);
    }
});

// Create a new bill
router.post('/', async (req, res, next) => {
    try {
        if (req.user.account_type !== 'PARENT') {
            throw new AppError('Only parent accounts can create bills', 403);
        }

        const { title, url, frequency, nextDueDate, categoryId, cost } = req.body;
        const result = await Bill.create({
            title,
            url,
            frequency,
            nextDueDate,
            categoryId,
            cost,
            createdBy: req.user.id
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update a bill
router.put('/:id', async (req, res, next) => {
    try {
        const { title, url, frequency, nextDueDate, categoryId, cost } = req.body;
        const result = await Bill.update(req.params.id, req.user.id, {
            title,
            url,
            frequency,
            nextDueDate,
            categoryId,
            cost
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete a bill
router.delete('/:id', async (req, res, next) => {
    try {
        await Bill.delete(req.params.id, req.user.id);
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Mark a bill as paid
router.post('/:id/mark-paid', async (req, res, next) => {
    try {
        const result = await Bill.markPaid(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 