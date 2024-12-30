const db = require('../db');

class Category {
    static async getAllWithUsage() {
        // First check if tables exist
        try {
            const tableCheck = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND (name='bills' OR name='accounts')
            `);
            
            // If tables don't exist yet, return just the categories
            if (!tableCheck) {
                const query = `
                    SELECT 
                        id,
                        name,
                        color,
                        is_predefined,
                        0 as bills_count,
                        0 as accounts_count
                    FROM categories
                    ORDER BY name ASC;
                `;
                return await db.all(query);
            }

            // If tables exist, use the full query
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.color,
                    c.is_predefined,
                    COALESCE(b.bills_count, 0) as bills_count,
                    COALESCE(a.accounts_count, 0) as accounts_count
                FROM categories c
                LEFT JOIN (
                    SELECT category_id, COUNT(*) as bills_count
                    FROM bills
                    GROUP BY category_id
                ) b ON c.id = b.category_id
                LEFT JOIN (
                    SELECT category_id, COUNT(*) as accounts_count
                    FROM accounts
                    GROUP BY category_id
                ) a ON c.id = a.category_id
                ORDER BY c.name ASC;
            `;

            console.log('Executing category query:', query);
            const rows = await db.all(query);
            console.log('Query results:', rows);
            return rows;
        } catch (error) {
            console.error('Error in getAllWithUsage:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                errno: error.errno
            });
            throw error; // Preserve the original error
        }
    }

    static async create(name, color = 'orange') {
        const checkQuery = 'SELECT id FROM categories WHERE name = ?';
        const insertQuery = 'INSERT INTO categories (name, color, is_predefined) VALUES (?, ?, false)';

        try {
            const existing = await db.get(checkQuery, [name]);
            if (existing) {
                throw new Error('Category already exists');
            }

            const result = await db.run(insertQuery, [name, color]);
            return {
                id: result.lastID,
                name,
                color,
                is_predefined: false,
                bills_count: 0,
                accounts_count: 0
            };
        } catch (error) {
            if (error.message === 'Category already exists') {
                throw error;
            }
            console.error('Error in create:', error);
            throw new Error('Failed to create category');
        }
    }

    static async rename(id, newName) {
        const checkQuery = 'SELECT id FROM categories WHERE name = ? AND id != ?';
        const updateQuery = 'UPDATE categories SET name = ? WHERE id = ? AND NOT is_predefined';

        try {
            const existing = await db.get(checkQuery, [newName, id]);
            if (existing) {
                throw new Error('Category already exists');
            }

            const result = await db.run(updateQuery, [newName, id]);
            if (result.changes === 0) {
                throw new Error('Category not found or is predefined');
            }

            return {
                id,
                name: newName,
                is_predefined: false
            };
        } catch (error) {
            if (error.message === 'Category already exists' || error.message === 'Category not found or is predefined') {
                throw error;
            }
            console.error('Error in rename:', error);
            throw new Error('Failed to rename category');
        }
    }

    static async updateColor(id, color) {
        const updateQuery = 'UPDATE categories SET color = ? WHERE id = ?';

        try {
            console.log(`Attempting to update category ${id} with color ${color}`);
            const result = await db.run(updateQuery, [color, id]);
            console.log('Update result:', result);
            if (result.changes === 0) {
                throw new Error('Category not found');
            }

            return {
                id,
                color
            };
        } catch (error) {
            console.error('Error in updateColor:', error);
            throw new Error('Failed to update category color');
        }
    }

    static async delete(id) {
        const checkCategoryQuery = 'SELECT id FROM categories WHERE id = ?';
        const checkUsageQuery = `
            SELECT 
                (SELECT COUNT(*) FROM bills WHERE category_id = ?) as bills_count,
                (SELECT COUNT(*) FROM accounts WHERE category_id = ?) as accounts_count
        `;
        const deleteQuery = 'DELETE FROM categories WHERE id = ?';

        try {
            const category = await db.get(checkCategoryQuery, [id]);
            if (!category) {
                throw new Error('Category not found');
            }

            const usage = await db.get(checkUsageQuery, [id, id]);
            if (usage.bills_count > 0 || usage.accounts_count > 0) {
                throw new Error('Category is in use');
            }

            const result = await db.run(deleteQuery, [id]);
            if (result.changes === 0) {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            if (error.message === 'Category not found' || 
                error.message === 'Category is in use') {
                throw error;
            }
            console.error('Error in delete:', error);
            throw new Error('Failed to delete category');
        }
    }
}

module.exports = Category; 