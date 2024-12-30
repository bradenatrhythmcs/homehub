const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/database');

// Ensure the data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Opening database at:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Database connection error:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            errno: err.errno,
            path: DB_PATH
        });
        process.exit(1);
    }
    console.log('Connected to database successfully');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        console.log('Executing SQL (run):', sql, 'with params:', params);
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database run error:', {
                    message: err.message,
                    stack: err.stack,
                    code: err.code,
                    errno: err.errno,
                    sql,
                    params
                });
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        console.log('Executing SQL (all):', sql, 'with params:', params);
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database all error:', {
                    message: err.message,
                    stack: err.stack,
                    code: err.code,
                    errno: err.errno,
                    sql,
                    params
                });
                reject(err);
            } else {
                console.log('Query returned', rows?.length || 0, 'rows');
                resolve(rows);
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        console.log('Executing SQL (get):', sql, 'with params:', params);
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Database get error:', {
                    message: err.message,
                    stack: err.stack,
                    code: err.code,
                    errno: err.errno,
                    sql,
                    params
                });
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Handle database errors
db.on('error', (err) => {
    console.error('Database error event:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        errno: err.errno
    });
});

module.exports = {
    run: dbRun,
    all: dbAll,
    get: dbGet
}; 