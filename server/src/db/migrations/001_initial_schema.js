const fs = require('fs');
const path = require('path');

module.exports = {
    version: 11,
    description: 'Initial schema with all migrations applied',
    
    async up(db) {
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await db.run(statement);
            }
        }
    },
    
    async down(db) {
        // Drop tables in reverse order of creation to respect foreign key constraints
        const tables = [
            'access_logs',
            'accounts',
            'bills',
            'categories',
            'passwords',
            'wifi_networks',
            'users',
            'schema_versions'
        ];
        
        for (const table of tables) {
            await db.run(`DROP TABLE IF EXISTS ${table}`);
        }
    }
}; 