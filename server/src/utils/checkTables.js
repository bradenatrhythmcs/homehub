const db = require('../config/db');

async function checkTables() {
    try {
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        const result = await db.query(query);
        console.log('Existing tables:', result.rows.map(row => row.table_name));
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        db.pool.end();
    }
}

checkTables(); 