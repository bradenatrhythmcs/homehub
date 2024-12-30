const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/database');

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

// Promisify database methods
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Create a wrapper object with promisified methods
const dbWrapper = {
    run: dbRun,
    all: dbAll,
    get: dbGet
};

async function createTables() {
    // Users table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            date_of_birth TEXT,
            account_type TEXT NOT NULL DEFAULT 'CHILD',
            is_admin INTEGER DEFAULT 0,
            display_name TEXT,
            email TEXT,
            theme_preference TEXT DEFAULT 'light',
            language_preference TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Passwords table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS passwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            iv TEXT,
            url TEXT,
            is_child_visible INTEGER DEFAULT 0,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // WiFi Networks table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS wifi_networks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ssid TEXT NOT NULL,
            password TEXT NOT NULL,
            security_type TEXT,
            notes TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Bills table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            url TEXT,
            frequency TEXT NOT NULL DEFAULT 'MONTHLY',
            next_due_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            category_id INTEGER,
            status TEXT DEFAULT 'pending',
            cost REAL,
            notes TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

    // Categories table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            is_predefined INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Contacts table
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            notes TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);
}

async function migrate() {
    try {
        // First create all tables if they don't exist
        await createTables();

        // Add any necessary columns or modifications here
        const tableInfo = await dbWrapper.all("PRAGMA table_info(passwords)");
        const hasIvColumn = tableInfo.some(col => col.name === 'iv');
        
        if (!hasIvColumn) {
            await dbWrapper.run('ALTER TABLE passwords ADD COLUMN iv TEXT');
        }

        // Check if categories table has is_predefined column
        const categoriesInfo = await dbWrapper.all("PRAGMA table_info(categories)");
        const hasIsPredefinedColumn = categoriesInfo.some(col => col.name === 'is_predefined');
        
        if (!hasIsPredefinedColumn) {
            await dbWrapper.run('ALTER TABLE categories ADD COLUMN is_predefined INTEGER DEFAULT 0');
        }

        // Insert default categories if they don't exist
        const categories = [
            { name: 'Utilities', color: '#FF6B6B' },
            { name: 'Rent/Mortgage', color: '#4ECDC4' },
            { name: 'Insurance', color: '#45B7D1' },
            { name: 'Internet', color: '#96CEB4' },
            { name: 'Phone', color: '#FFEEAD' },
            { name: 'Other', color: '#D4D4D4' }
        ];

        for (const category of categories) {
            // First try to insert
            await dbWrapper.run(
                'INSERT OR IGNORE INTO categories (name, color, is_predefined) VALUES (?, ?, 1)',
                [category.name, category.color]
            );
            
            // Then update is_predefined for existing categories
            await dbWrapper.run(
                'UPDATE categories SET is_predefined = 1 WHERE name = ?',
                [category.name]
            );
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate(); 