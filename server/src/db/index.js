const sqlite3 = require('sqlite3');
const { DB_PATH } = require('../config/database');

let db = null;

const initialize = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            resolve();
        });
    });
};

const get = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

const all = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

const run = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this);
        });
    });
};

module.exports = {
    initialize,
    get,
    all,
    run
}; 