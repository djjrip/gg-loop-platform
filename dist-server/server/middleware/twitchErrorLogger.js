// server/middleware/twitchErrorLogger.ts
import fs from 'fs';
import path from 'path';
/**
 * Middleware that captures any error occurring on the Twitch OAuth callback
 * and writes a detailed stack trace to a log file. This helps us see exactly
 * where the error originates (inside our code, a library, or an external service).
 */
export function twitchErrorLogger(err, req, res, next) {
    // Only act on the Twitch callback route
    if (req.path && req.path.startsWith('/api/settings/twitch/callback')) {
        const logDir = path.resolve(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logPath = path.join(logDir, 'twitch-error.log');
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${err.stack || err}\n\n`;
        try {
            fs.appendFileSync(logPath, entry);
        }
        catch (e) {
            console.error('Failed to write Twitch error log:', e);
        }
    }
    // Pass the error to the next error handler
    next(err);
}
