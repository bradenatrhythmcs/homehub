const path = require('path');
const fs = require('fs').promises;
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

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

async function getCurrentVersion() {
    try {
        const result = await dbGet('SELECT MAX(version) as version FROM schema_versions');
        return result?.version || 0;
    } catch (error) {
        return 0;
    }
}

async function updateVersion(version, description) {
    await dbRun(
        'INSERT INTO schema_versions (version, description) VALUES (?, ?)',
        [version, description]
    );
}

async function runMigration() {
    try {
        // Ensure schema_versions table exists
        await dbRun(`
            CREATE TABLE IF NOT EXISTS schema_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER NOT NULL,
                description TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const currentVersion = await getCurrentVersion();
        console.log('Current database version:', currentVersion);

        // Read all SQL migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        for (const file of sqlFiles) {
            const version = parseInt(file.split('_')[0]);
            if (version > currentVersion) {
                console.log(`Running migration ${file}...`);
                const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
                
                // Split SQL into individual statements
                const statements = sql.split(';').filter(stmt => stmt.trim());
                
                await dbRun('BEGIN TRANSACTION');
                try {
                    // Run each SQL statement in the migration
                    for (const statement of statements) {
                        if (statement.trim()) {
                            await dbRun(statement);
                            console.log('Executed statement:', statement.trim().split('\n')[0]);
                        }
                    }

                    // Extract description from the migration file name
                    const description = file.split('_').slice(1).join('_').replace('.sql', '');
                    await updateVersion(version, description);
                    
                    await dbRun('COMMIT');
                    console.log(`Successfully completed migration ${file}`);
                } catch (error) {
                    console.error('Error executing statement:', error);
                    await dbRun('ROLLBACK');
                    throw error;
                }
            }
        }

        const newVersion = await getCurrentVersion();
        console.log(`Migrations completed. Database version updated from ${currentVersion} to ${newVersion}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 