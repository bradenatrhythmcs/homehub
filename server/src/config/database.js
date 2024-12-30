const path = require('path');
const fs = require('fs').promises;

// Get database path from environment or use default
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');

// Ensure data directory exists
const ensureDataDirectory = async () => {
    const dataDir = path.dirname(DB_PATH);
    try {
        await fs.access(dataDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }
};

module.exports = {
    DB_PATH,
    ensureDataDirectory
}; 