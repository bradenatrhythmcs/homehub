const db = require('../db');
const AppError = require('../utils/AppError');

class Bill {
    static async getCategories() {
        return db.all(
            `SELECT id, name, color
            FROM categories
            ORDER BY name ASC`
        );
    }

    static async findAll(userId) {
        // First check if the user is a parent
        const user = await db.get('SELECT account_type FROM users WHERE id = ?', [userId]);
        
        if (user.account_type === 'PARENT') {
            // Parent users can see all bills
            return db.all(
                `SELECT b.*, c.name as category_name, c.color as category_color,
                        u.username as creator_name
                FROM bills b
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN users u ON b.created_by = u.id
                ORDER BY b.due_date ASC`
            );
        } else {
            // Non-parent users only see their own bills
            return db.all(
                `SELECT b.*, c.name as category_name, c.color as category_color,
                        u.username as creator_name
                FROM bills b
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN users u ON b.created_by = u.id
                WHERE b.created_by = ?
                ORDER BY b.due_date ASC`,
                [userId]
            );
        }
    }

    static async findById(id) {
        return db.get(
            `SELECT b.*, c.name as category_name, c.color as category_color
            FROM bills b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?`,
            [id]
        );
    }

    static async create(data) {
        const { 
            title, 
            amount, 
            url, 
            frequency = 'MONTHLY',
            due_date,
            category_id,
            created_by,
            cost,
            notes
        } = data;

        const result = await db.run(
            `INSERT INTO bills (
                title, amount, url, frequency, due_date, next_due_date,
                category_id, created_by, cost, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                amount,
                url || null,
                frequency,
                due_date,
                due_date, // Initially, next_due_date is the same as due_date
                category_id,
                created_by,
                cost || null,
                notes || null
            ]
        );
        return this.findById(result.lastID);
    }

    static async update(id, userId, data) {
        const bill = await this.findById(id);
        if (!bill) {
            throw new AppError('Bill not found', 404);
        }
        if (bill.created_by !== userId) {
            throw new AppError('Access denied', 403);
        }

        const {
            title,
            amount,
            url,
            frequency,
            due_date,
            category_id,
            cost,
            notes
        } = data;

        await db.run(
            `UPDATE bills
            SET title = ?,
                amount = ?,
                url = ?,
                frequency = ?,
                due_date = ?,
                next_due_date = ?,
                category_id = ?,
                cost = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                title,
                amount,
                url || null,
                frequency,
                due_date,
                due_date, // Reset next_due_date when updating
                category_id,
                cost || null,
                notes || null,
                id
            ]
        );
        return this.findById(id);
    }

    static async delete(id, userId) {
        const bill = await this.findById(id);
        if (!bill) {
            throw new AppError('Bill not found', 404);
        }
        if (bill.created_by !== userId) {
            throw new AppError('Access denied', 403);
        }

        await db.run('DELETE FROM bills WHERE id = ?', [id]);
    }

    static async markPaid(id, userId) {
        const bill = await this.findById(id);
        if (!bill) {
            throw new AppError('Bill not found', 404);
        }
        if (bill.created_by !== userId) {
            throw new AppError('Access denied', 403);
        }

        // Calculate next due date based on frequency
        const nextDueDate = this.calculateNextDueDate(bill.due_date, bill.frequency);

        await db.run(
            `UPDATE bills
            SET next_due_date = ?,
                status = 'paid',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [nextDueDate, id]
        );
        return this.findById(id);
    }

    static calculateNextDueDate(currentDueDate, frequency) {
        const date = new Date(currentDueDate);
        switch (frequency.toUpperCase()) {
            case 'WEEKLY':
                date.setDate(date.getDate() + 7);
                break;
            case 'BIWEEKLY':
                date.setDate(date.getDate() + 14);
                break;
            case 'MONTHLY':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'QUARTERLY':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'YEARLY':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                throw new AppError('Invalid frequency', 400);
        }
        return date.toISOString().split('T')[0];
    }
}

module.exports = Bill; 