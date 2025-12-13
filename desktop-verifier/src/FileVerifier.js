const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileVerifier {
    constructor() {
        this.riotLogsPath = this.getRiotLogsPath();
        this.screenshotsPath = this.getScreenshotsPath();
    }

    getRiotLogsPath() {
        // Platform-specific Riot Games logs path
        const platform = process.platform;
        if (platform === 'win32') {
            return path.join(process.env.LOCALAPPDATA, 'Riot Games', 'Riot Client', 'Logs');
        } else if (platform === 'darwin') {
            return path.join(process.env.HOME, 'Library', 'Application Support', 'Riot Games', 'Riot Client', 'Logs');
        }
        return null;
    }

    getScreenshotsPath() {
        // Platform-specific screenshots path
        const platform = process.platform;
        if (platform === 'win32') {
            return path.join(process.env.USERPROFILE, 'Pictures', 'Screenshots');
        } else if (platform === 'darwin') {
            return path.join(process.env.HOME, 'Desktop'); // macOS screenshots go to Desktop by default
        }
        return null;
    }

    async findMatchLogs(matchId) {
        if (!this.riotLogsPath || !fs.existsSync(this.riotLogsPath)) {
            console.log('[FileVerifier] Riot logs path not found');
            return null;
        }

        try {
            const files = fs.readdirSync(this.riotLogsPath);
            const matchFiles = files.filter(file => file.includes(matchId));

            if (matchFiles.length > 0) {
                const filePath = path.join(this.riotLogsPath, matchFiles[0]);
                const stats = fs.statSync(filePath);

                return {
                    found: true,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime,
                    hash: await this.hashFile(filePath)
                };
            }

            return { found: false };
        } catch (error) {
            console.error('[FileVerifier] Error finding match logs:', error.message);
            return { found: false, error: error.message };
        }
    }

    async findScreenshots(timeRange = 3600000) { // Default: last hour
        if (!this.screenshotsPath || !fs.existsSync(this.screenshotsPath)) {
            console.log('[FileVerifier] Screenshots path not found');
            return [];
        }

        try {
            const now = Date.now();
            const files = fs.readdirSync(this.screenshotsPath);
            const recentScreenshots = [];

            for (const file of files) {
                if (file.match(/\.(png|jpg|jpeg)$/i)) {
                    const filePath = path.join(this.screenshotsPath, file);
                    const stats = fs.statSync(filePath);

                    if (now - stats.mtime.getTime() <= timeRange) {
                        recentScreenshots.push({
                            path: filePath,
                            name: file,
                            size: stats.size,
                            modified: stats.mtime,
                            hash: await this.hashFile(filePath)
                        });
                    }
                }
            }

            return recentScreenshots;
        } catch (error) {
            console.error('[FileVerifier] Error finding screenshots:', error.message);
            return [];
        }
    }

    async hashFile(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);

            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    async verifyMatchProof(matchId) {
        const matchLogs = await this.findMatchLogs(matchId);
        const screenshots = await this.findScreenshots();

        return {
            matchId,
            logsFound: matchLogs?.found || false,
            logsData: matchLogs,
            screenshotsFound: screenshots.length,
            screenshots: screenshots.slice(0, 5), // Limit to 5 most recent
            timestamp: new Date().toISOString(),
            verificationScore: this.calculateVerificationScore(matchLogs, screenshots)
        };
    }

    calculateVerificationScore(matchLogs, screenshots) {
        let score = 0;

        // Logs found: +50 points
        if (matchLogs?.found) score += 50;

        // Screenshots found: +10 points each (max 50)
        score += Math.min(screenshots.length * 10, 50);

        return Math.min(score, 100);
    }
}

module.exports = FileVerifier;
