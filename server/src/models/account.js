const db = require('../db');
const AppError = require('../utils/AppError');

class Account {
    static async create({ title, categoryId, ownerId, accountNumber, companyName, note, passwordId, billId, createdBy }) {
        const result = await db.run(
            `INSERT INTO accounts (
                title, category_id, owner_id, account_number, company_name, note, 
                password_id, bill_id, created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, categoryId, ownerId, accountNumber, companyName, note, passwordId, billId, createdBy]
        );

        return this.findById(result.lastID);
    }

    static async findAll(userId) {
        // First check if the user is a parent
        const user = await db.get('SELECT account_type FROM users WHERE id = ?', [userId]);
        
        if (user.account_type === 'PARENT') {
            // Parent users can see all accounts
            return db.all(
                `SELECT accounts.*, 
                        categories.name as category_name,
                        categories.color as category_color,
                        owner.username as owner_username,
                        creator.username as creator_name,
                        passwords.title as password_title,
                        bills.title as bill_title
                FROM accounts
                LEFT JOIN categories ON accounts.category_id = categories.id
                LEFT JOIN users owner ON accounts.owner_id = owner.id
                LEFT JOIN users creator ON accounts.created_by = creator.id
                LEFT JOIN passwords ON accounts.password_id = passwords.id
                LEFT JOIN bills ON accounts.bill_id = bills.id
                ORDER BY accounts.title ASC`
            );
        } else {
            // Non-parent users only see their own accounts
            return db.all(
                `SELECT accounts.*, 
                        categories.name as category_name,
                        categories.color as category_color,
                        owner.username as owner_username,
                        creator.username as creator_name,
                        passwords.title as password_title,
                        bills.title as bill_title
                FROM accounts
                LEFT JOIN categories ON accounts.category_id = categories.id
                LEFT JOIN users owner ON accounts.owner_id = owner.id
                LEFT JOIN users creator ON accounts.created_by = creator.id
                LEFT JOIN passwords ON accounts.password_id = passwords.id
                LEFT JOIN bills ON accounts.bill_id = bills.id
                WHERE accounts.created_by = ? OR accounts.owner_id = ?
                ORDER BY accounts.title ASC`,
                [userId, userId]
            );
        }
    }

    static async findById(accountId) {
        return db.get(
            `SELECT accounts.*, 
                    categories.name as category_name,
                    categories.color as category_color,
                    owner.username as owner_username,
                    creator.username as creator_name,
                    passwords.title as password_title,
                    bills.title as bill_title
            FROM accounts
            LEFT JOIN categories ON accounts.category_id = categories.id
            LEFT JOIN users owner ON accounts.owner_id = owner.id
            LEFT JOIN users creator ON accounts.created_by = creator.id
            LEFT JOIN passwords ON accounts.password_id = passwords.id
            LEFT JOIN bills ON accounts.bill_id = bills.id
            WHERE accounts.id = ?`,
            [accountId]
        );
    }

    static async update(accountId, userId, data) {
        const [account, user] = await Promise.all([
            this.findById(accountId),
            db.get('SELECT account_type FROM users WHERE id = ?', [userId])
        ]);

        if (!account) {
            throw new AppError('Account not found', 404);
        }

        // Allow update if user is a parent or the creator
        if (user.account_type !== 'PARENT' && account.created_by !== userId) {
            throw new AppError('Not authorized to update this account', 403);
        }

        const { title, categoryId, ownerId, accountNumber, companyName, note, passwordId, billId } = data;

        await db.run(
            `UPDATE accounts
            SET title = ?,
                category_id = ?,
                owner_id = ?,
                account_number = ?,
                company_name = ?,
                note = ?,
                password_id = ?,
                bill_id = ?
            WHERE id = ?`,
            [title, categoryId, ownerId, accountNumber, companyName, note, passwordId, billId, accountId]
        );

        return this.findById(accountId);
    }

    static async delete(accountId, userId) {
        const [account, user] = await Promise.all([
            this.findById(accountId),
            db.get('SELECT account_type FROM users WHERE id = ?', [userId])
        ]);

        if (!account) {
            throw new AppError('Account not found', 404);
        }

        // Allow deletion if user is a parent or the creator
        if (user.account_type !== 'PARENT' && account.created_by !== userId) {
            throw new AppError('Not authorized to delete this account', 403);
        }

        await db.run('DELETE FROM accounts WHERE id = ?', [accountId]);
    }

    static async getCategories() {
        return db.all(
            `SELECT id, name, color 
            FROM categories 
            ORDER BY name ASC`
        );
    }
}

module.exports = Account; 