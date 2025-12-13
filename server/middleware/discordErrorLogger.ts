// server/middleware/discordErrorLogger.ts
import fs from 'fs';
import path from 'path';

/**
 * Middleware that captures any error occurring on the Discord OAuth callback
 * and writes a detailed stack trace to a log file. This helps us see exactly
 * where the "Date" serialization error originates (inside passport, our code,
 * or a library).
 */
export function discordErrorLogger(err: any, req: any, res: any, next: any) {
    // Only act on the Discord callback route
    if (req.path && req.path.startsWith('/api/auth/discord/callback')) {
        const logDir = path.resolve(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logPath = path.join(logDir, 'discord-error.log');
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${err.stack || err}\n\n`;
        try {
            fs.appendFileSync(logPath, entry);
        } catch (e) {
            console.error('Failed to write Discord error log:', e);
        }
    }
    // Pass the error along to any other error handlers
    next(err);
}
