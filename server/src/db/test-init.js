const { initDatabase, db } = require('../models/database');

async function testDatabaseInit() {
    try {
        console.log('Starting database initialization test...');
        
        // Initialize the database
        await initDatabase();
        console.log('Database initialized successfully');
        
        // Verify each table exists and has the correct structure
        const tables = [
            'users',
            'wifi_networks',
            'passwords',
            'bills',
            'accounts',
            'access_logs'
        ];
        
        for (const table of tables) {
            const query = `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`;
            db.get(query, [table], (err, result) => {
                if (err) {
                    console.error(`Error checking table ${table}:`, err);
                } else if (!result) {
                    console.error(`Table ${table} was not created`);
                } else {
                    console.log(`✓ Table ${table} exists with structure:`);
                    console.log(result.sql);
                    console.log('---');
                }
            });
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testDatabaseInit(); 