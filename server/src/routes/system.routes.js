const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { authenticateToken, adminRequired } = require('../middleware/auth');
const { promisify } = require('util');
const execAsync = promisify(exec);
const SystemSettings = require('../models/system.settings');
const { Octokit } = require('@octokit/rest').Octokit;

// Track server start time
const SERVER_START_TIME = Date.now();

// Helper function to execute scripts
const executeScript = (scriptPath, args = []) => {
    return new Promise((resolve, reject) => {
        const command = `${scriptPath} ${args.join(' ')}`;
        console.log('Executing command:', command);

        exec(command, (error, stdout, stderr) => {
            console.log('Script stdout:', stdout);
            console.log('Script stderr:', stderr);
            
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

// Check for updates using GitHub API
const checkForUpdates = async () => {
    try {
        const token = await SystemSettings.getGitHubToken();
        if (!token) {
            return { 
                hasUpdate: false, 
                error: 'GitHub token not configured',
                currentVersion: await getGitVersion()
            };
        }

        const octokit = new Octokit({ auth: token });
        const [owner, repo] = process.env.GITHUB_REPO.split('/');
        
        // Get latest release
        const { data: latestRelease } = await octokit.repos.getLatestRelease({
            owner,
            repo
        });

        const currentVersion = await getGitVersion();
        const hasUpdate = latestRelease.tag_name !== currentVersion;

        return {
            hasUpdate,
            currentVersion,
            latestVersion: latestRelease.tag_name,
            releaseNotes: latestRelease.body,
            releaseUrl: latestRelease.html_url
        };
    } catch (error) {
        console.error('Error checking for updates:', error);
        return {
            hasUpdate: false,
            error: error.message,
            currentVersion: await getGitVersion()
        };
    }
};

// Apply system update
const applyUpdate = async () => {
    try {
        const updateScript = path.join(__dirname, '../../scripts/update.sh');
        const result = await executeScript(updateScript);
        return { success: true, ...result };
    } catch (error) {
        console.error('Error applying update:', error);
        return { success: false, error: error.message };
    }
};

// Get system vitals (public endpoint)
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
        
        // Calculate server uptime in seconds
        const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);

        // Get update status
        const updateStatus = await checkForUpdates();

        res.json({
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0].model,
                speed: os.cpus()[0].speed,
                load: os.loadavg()[0]
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
                usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
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
            version: version,
            update: updateStatus
        });
    } catch (error) {
        console.error('Error getting system vitals:', error);
        res.status(500).json({ error: 'Failed to get system vitals' });
    }
});

// Apply authentication and admin check for sensitive operations
router.use(authenticateToken);
router.use(adminRequired);

// Configure GitHub token
router.post('/github/token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Verify token works by making a test API call
        const octokit = new Octokit({ auth: token });
        const [owner, repo] = process.env.GITHUB_REPO.split('/');
        await octokit.repos.get({ owner, repo });

        // Save token if verification successful
        await SystemSettings.setGitHubToken(token);
        res.json({ success: true });
    } catch (error) {
        console.error('Error configuring GitHub token:', error);
        res.status(400).json({ error: 'Invalid GitHub token' });
    }
});

// Check for updates
router.get('/updates/check', async (req, res) => {
    try {
        const updateStatus = await checkForUpdates();
        res.json(updateStatus);
    } catch (error) {
        console.error('Error checking for updates:', error);
        res.status(500).json({ error: 'Failed to check for updates' });
    }
});

// Apply update
router.post('/updates/apply', async (req, res) => {
    try {
        const result = await applyUpdate();
        res.json(result);
    } catch (error) {
        console.error('Error applying update:', error);
        res.status(500).json({ error: 'Failed to apply update' });
    }
});

module.exports = router; 