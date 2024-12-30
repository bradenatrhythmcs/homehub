const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/database');

// Connect to the database
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

async function ensureVersionTable() {
    await dbWrapper.run(`
        CREATE TABLE IF NOT EXISTS schema_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL,
            description TEXT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getCurrentVersion() {
    try {
        const result = await dbWrapper.get('SELECT MAX(version) as version FROM schema_versions');
        return result?.version || 0;
    } catch (error) {
        console.error('Error getting current version:', error);
        return 0;
    }
}

async function runMigration(version) {
    try {
        await ensureVersionTable();
        const currentVersion = await getCurrentVersion();
        console.log('Current database version:', currentVersion);

        if (version <= currentVersion) {
            console.log(`Migration version ${version} has already been applied.`);
            process.exit(0);
            return;
        }

        const migrationPath = path.join(__dirname, 'migrations', `${String(version).padStart(3, '0')}_create_contacts.js`);
        const migration = require(migrationPath);

        console.log(`Running migration version ${version}: ${migration.description}`);
        await dbWrapper.run('BEGIN TRANSACTION');

        try {
            await migration.up(dbWrapper);
            await dbWrapper.run(
                'INSERT INTO schema_versions (version, description) VALUES (?, ?)',
                [migration.version, migration.description]
            );
            await dbWrapper.run('COMMIT');
            console.log(`Successfully completed migration version ${version}`);
        } catch (error) {
            await dbWrapper.run('ROLLBACK');
            throw error;
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration 12 (contacts)
runMigration(12); 