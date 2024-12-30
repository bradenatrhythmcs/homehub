const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const { authMiddleware } = require('../middleware/auth.middleware');
const AppError = require('../utils/AppError');

// Create a new contact
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            street_address,
            city,
            state,
            postal_code,
            country,
            phone_number,
            email,
            date_of_birth,
            contact_type
        } = req.body;

        if (!first_name || !last_name || !contact_type) {
            throw new AppError('First name, last name, and contact type are required', 400);
        }

        const contact = await Contact.create({
            createdBy: req.user.id,
            firstName: first_name,
            lastName: last_name,
            streetAddress: street_address,
            city,
            state,
            postalCode: postal_code,
            country,
            phoneNumber: phone_number,
            email,
            dateOfBirth: date_of_birth,
            contactType: contact_type
        });

        res.status(201).json({ contact });
    } catch (err) {
        next(err);
    }
});

// Get all contacts for the authenticated user
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const contacts = await Contact.findAll(req.user.id);
        res.json({ contacts: contacts || [] });
    } catch (err) {
        next(err);
    }
});

// Get a specific contact
router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            throw new AppError('Contact not found', 404);
        }
        res.json({ contact });
    } catch (err) {
        next(err);
    }
});

// Update a contact
router.patch('/:id', authMiddleware, async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            street_address,
            city,
            state,
            postal_code,
            country,
            phone_number,
            email,
            date_of_birth,
            contact_type
        } = req.body;

        if (!first_name || !last_name || !contact_type) {
            throw new AppError('First name, last name, and contact type are required', 400);
        }

        const contact = await Contact.update(req.params.id, req.user.id, {
            firstName: first_name,
            lastName: last_name,
            streetAddress: street_address,
            city,
            state,
            postalCode: postal_code,
            country,
            phoneNumber: phone_number,
            email,
            dateOfBirth: date_of_birth,
            contactType: contact_type
        });

        res.json({ contact });
    } catch (err) {
        next(err);
    }
});

// Delete a contact
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        await Contact.delete(req.params.id, req.user.id);
        res.json({ deleted: req.params.id });
    } catch (err) {
        next(err);
    }
});

module.exports = router; 