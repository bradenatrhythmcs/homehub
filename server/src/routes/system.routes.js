const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { authenticateToken, adminRequired } = require('../middleware/auth');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Track server start time
const SERVER_START_TIME = Date.now();

// Helper function to execute scripts
const executeScript = (scriptPath, args = []) => {
    return new Promise((resolve, reject) => {
        const command = `${scriptPath} ${args.join(' ')}`;
        console.log('Executing command:', command);

        exec(command, (error, stdout, stderr) => {
            // Log all output for debugging
            console.log('Script stdout:', stdout);
            console.log('Script stderr:', stderr);
            
            // Don't treat stderr as an error if the command succeeded
            if (error && error.code !== 0) {
                console.error('Script execution error:', {
                    command,
                    error: error.message,
                    code: error.code,
                    stderr,
                    stdout
                });
                reject({ command, error: error.message, stderr, stdout });
                return;
            }
            
            // Return both stdout and stderr
            resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim()
            });
        });
    });
};

// Get current git version
const getGitVersion = async () => {
    try {
        const { stdout } = await execAsync('git describe --tags --abbrev=0 || git rev-parse --short HEAD');
        return stdout.trim();
    } catch (error) {
        console.error('Error getting git version:', error);
        return null;
    }
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(adminRequired);

// Check for updates
router.get('/updates/check', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        console.log('Executing update check script:', scriptPath);
        
        const result = await executeScript(scriptPath, ['check']);
        console.log('Update check result:', result);
        
        // The script returns "Updates available" or "No updates available"
        const updatesAvailable = result.stdout.includes('Updates available');
        
        res.json({
            status: 'success',
            updates_available: updatesAvailable,
            message: result.stdout
        });
    } catch (error) {
        console.error('Update check error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to check for updates',
            details: error.message
        });
    }
});

// Get update details
router.get('/updates/details', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        console.log('Executing update details script:', scriptPath);
        
        const result = await executeScript(scriptPath, ['details']);
        console.log('Update details result:', result);
        
        res.json({
            status: 'success',
            details: result.stdout
        });
    } catch (error) {
        console.error('Update details error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to get update details',
            details: error.message
        });
    }
});

// Apply updates
router.post('/updates/apply', async (req, res) => {
    try {
        const scriptPath = path.resolve(__dirname, '../../../scripts/update.sh');
        console.log('Executing update apply script:', scriptPath);
        
        const result = await executeScript(scriptPath, ['apply']);
        console.log('Update apply result:', result);
        
        res.json({
            status: 'success',
            message: 'Updates applied successfully',
            details: result.stdout
        });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to apply updates',
            details: error.message
        });
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

        // Get git version
        const version = await getGitVersion();

        // Calculate CPU load
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        
        // Calculate server uptime in seconds
        const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);

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
                uptime: uptime,
                environment: process.env.NODE_ENV || 'development'
            },
            database: {
                exists: dbExists,
                size: dbSize,
                path: dbPath
            },
            version: version
        });
    } catch (error) {
        console.error('Error getting system vitals:', error);
        res.status(500).json({ error: 'Failed to get system vitals' });
    }
});

module.exports = router; 