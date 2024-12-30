const db = require('./index');
const path = require('path');
const fs = require('fs').promises;

const migrate = async () => {
    try {
        // Create migrations table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get list of executed migrations
        const executedMigrations = await db.all('SELECT name FROM migrations');
        const executedNames = new Set(executedMigrations.map(m => m.name));

        // Get all migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files.filter(f => f.endsWith('.js')).sort();

        // Execute migrations in order
        for (const file of migrationFiles) {
            if (!executedNames.has(file)) {
                console.log(`Executing migration: ${file}`);
                const migration = require(path.join(migrationsDir, file));
                
                // Begin transaction
                await db.run('BEGIN TRANSACTION');
                
                try {
                    await migration.up(db);
                    await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
                    await db.run('COMMIT');
                    console.log(`Migration ${file} completed successfully`);
                } catch (error) {
                    await db.run('ROLLBACK');
                    throw error;
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

// If this file is run directly, execute migrations
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('All migrations completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrate }; 