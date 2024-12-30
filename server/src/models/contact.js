const db = require('../db');
const AppError = require('../utils/AppError');

class Contact {
    static async create({
        createdBy,
        firstName,
        lastName,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        email,
        dateOfBirth,
        contactType
    }) {
        const result = await db.run(
            `INSERT INTO contacts (
                created_by,
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                createdBy,
                firstName,
                lastName,
                streetAddress,
                city,
                state,
                postalCode,
                country,
                phoneNumber,
                email,
                dateOfBirth,
                contactType
            ]
        );

        return db.get('SELECT * FROM contacts WHERE id = ?', [result.lastID]);
    }

    static async findAll(userId) {
        // All users can see all contacts
        return db.all(
            `SELECT contacts.*, users.username as creator_name
            FROM contacts
            LEFT JOIN users ON contacts.created_by = users.id
            ORDER BY last_name, first_name`
        );
    }

    static async findById(contactId) {
        return db.get(
            `SELECT contacts.*, users.username as creator_name
            FROM contacts
            LEFT JOIN users ON contacts.created_by = users.id
            WHERE contacts.id = ?`,
            [contactId]
        );
    }

    static async update(contactId, userId, data) {
        const contact = await this.findById(contactId);
        
        if (!contact) {
            throw new AppError('Contact not found', 404);
        }
        
        // Only allow the creator to update the contact
        if (contact.created_by !== userId) {
            throw new AppError('Not authorized to update this contact', 403);
        }

        const {
            firstName,
            lastName,
            streetAddress,
            city,
            state,
            postalCode,
            country,
            phoneNumber,
            email,
            dateOfBirth,
            contactType
        } = data;

        await db.run(
            `UPDATE contacts
            SET first_name = ?,
                last_name = ?,
                street_address = ?,
                city = ?,
                state = ?,
                postal_code = ?,
                country = ?,
                phone_number = ?,
                email = ?,
                date_of_birth = ?,
                contact_type = ?
            WHERE id = ?`,
            [
                firstName,
                lastName,
                streetAddress,
                city,
                state,
                postalCode,
                country,
                phoneNumber,
                email,
                dateOfBirth,
                contactType,
                contactId
            ]
        );

        return this.findById(contactId);
    }

    static async delete(contactId, userId) {
        const contact = await this.findById(contactId);
        
        if (!contact) {
            throw new AppError('Contact not found', 404);
        }
        
        // Only allow the creator to delete the contact
        if (contact.created_by !== userId) {
            throw new AppError('Not authorized to delete this contact', 403);
        }

        await db.run(
            `DELETE FROM contacts
            WHERE id = ?`,
            [contactId]
        );
    }
}

module.exports = Contact; 