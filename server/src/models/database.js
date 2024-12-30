const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/database');
const fs = require('fs');

// Ensure the database directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

// Initialize database tables
const initDatabase = async () => {
    const { spawn } = require('child_process');
    const migratePath = path.join(__dirname, '..', 'db', 'migrate.js');
    
    return new Promise((resolve, reject) => {
        const migrate = spawn('node', [migratePath], {
            stdio: 'inherit'
        });

        migrate.on('close', (code) => {
            if (code === 0) {
                console.log('Database migration completed successfully');
                resolve();
            } else {
                const error = new Error('Database migration failed');
                console.error(error);
                reject(error);
            }
        });

        migrate.on('error', (error) => {
            console.error('Failed to start migration:', error);
            reject(error);
        });
    });
};

// Helper to run queries with promises
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            resolve(this);
        });
    });
};

// Helper to get results with promises
const getQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

module.exports = {
    db,
    initDatabase,
    runQuery,
    getQuery
}; 