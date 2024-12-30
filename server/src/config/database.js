const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/database.sqlite');

// Export the database configuration
module.exports = {
    DB_PATH,
    DB_NAME: 'database.sqlite'
}; 