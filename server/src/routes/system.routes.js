const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { authenticateToken, adminRequired } = require('../middleware/auth');

// Helper function to execute scripts
const executeScript = (scriptPath, args = []) => {
    return new Promise((resolve, reject) => {
        const command = `${scriptPath} ${args.join(' ')}`;
        console.log('Executing command:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Script execution error:', {
                    command,
                    error: error.message,
                    stderr,
                    stdout
                });
                reject({ command, error: error.message, stderr, stdout });
                return;
            }
            resolve(stdout.trim());
        });
    });
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(adminRequired);

// Check for updates
router.get('/updates/check', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        const result = await executeScript(scriptPath, ['check']);
        res.json({ updates_available: result.includes('Updates available') });
    } catch (error) {
        console.error('Update check error:', error);
        res.status(500).json({ error: 'Failed to check for updates' });
    }
});

// Get update details
router.get('/updates/details', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        const result = await executeScript(scriptPath, ['details']);
        res.json({ details: result });
    } catch (error) {
        console.error('Update details error:', error);
        res.status(500).json({ error: 'Failed to get update details' });
    }
});

// Apply updates
router.post('/updates/apply', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        const result = await executeScript(scriptPath, ['apply']);
        res.json({ message: 'Updates applied successfully', details: result });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to apply updates' });
    }
});

// Get system vitals
router.get('/vitals', async (req, res) => {
    try {
        const os = require('os');
        const fs = require('fs').promises;
        const dbPath = require('../config/database').DB_PATH;

        // Get database size
        let dbSize = 0;
        let dbExists = false;
        try {
            const stats = await fs.stat(dbPath);
            dbSize = stats.size;
            dbExists = true;
        } catch (error) {
            console.log('Database file not found:', dbPath);
        }

        // Calculate CPU load
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const uptime = os.uptime();

        res.json({
            cpu: {
                cores: cpus.length,
                model: cpus[0].model,
                speed: cpus[0].speed,
                load: loadAvg[0]
            },
            memory: {
                total: totalMem,
                free: freeMem,
                used: totalMem - freeMem,
                usage: ((totalMem - freeMem) / totalMem * 100).toFixed(2)
            },
            system: {
                platform: os.platform(),
                release: os.release(),
                uptime: uptime
            },
            database: {
                exists: dbExists,
                size: dbSize,
                path: dbPath
            }
        });
    } catch (error) {
        console.error('Error getting system vitals:', error);
        res.status(500).json({ error: 'Failed to get system vitals' });
    }
});

module.exports = router; 