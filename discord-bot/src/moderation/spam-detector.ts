import { Message } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';
import { db } from '../utils/database';

interface SpamResult {
    isSpam: boolean;
    reason?: string;
}

export async function detectSpam(message: Message): Promise<SpamResult> {
    // Check for repeated characters
    if (hasRepeatedCharacters(message.content)) {
        return { isSpam: true, reason: 'Repeated characters' };
    }

    // Check for excessive links
    if (hasExcessiveLinks(message.content)) {
        return { isSpam: true, reason: 'Too many links' };
    }

    // Check for Discord invites (not GG LOOP)
    if (hasUnauthorizedInvite(message.content)) {
        return { isSpam: true, reason: 'Unauthorized Discord invite' };
    }

    // Check message rate  
    if (await isRateLimitExceeded(message)) {
        return { isSpam: true, reason: 'Message spam (rate limit exceeded)' };
    }

    return { isSpam: false };
}

function hasRepeatedCharacters(content: string): boolean {
    const regex = new RegExp(`(.)\\1{${config.spam.maxRepeatedChars},}`, 'i');
    return regex.test(content);
}

function hasExcessiveLinks(content: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex) || [];

    // Filter out whitelisted domains
    const nonWhitelisted = matches.filter(url => {
        return !config.whitelist.some(domain => url.includes(domain));
    });

    return nonWhitelisted.length > config.spam.maxLinksPerMessage;
}

function hasUnauthorizedInvite(content: string): boolean {
    const inviteRegex = /discord\.gg\/([a-zA-Z0-9]+)/i;
    const match = content.match(inviteRegex);

    if (!match) return false;

    // Check if it's the GG LOOP invite
    return !config.whitelist.some(whitelisted => content.includes(whitelisted));
}

async function isRateLimitExceeded(message: Message): Promise<boolean> {
    const userId = message.author.id;
    const currentTime = Date.now();
    const windowSize = 10 * 1000; // 10 seconds

    try {
        const stmt = db.prepare(`
      SELECT messageCount, windowStart FROM message_spam WHERE userId = ?
    `);
        const row = stmt.get(userId) as { messageCount: number; windowStart: number } | undefined;

        if (!row) {
            // First message in window
            db.prepare(`
        INSERT INTO message_spam (userId, messageCount, windowStart) VALUES (?, 1, ?)
      `).run(userId, currentTime);
            return false;
        }

        // Check if window expired
        if (currentTime - row.windowStart > windowSize) {
            // Reset window
            db.prepare(`
        UPDATE message_spam SET messageCount = 1, windowStart = ? WHERE userId = ?
      `).run(currentTime, userId);
            return false;
        }

        // Increment count
        const newCount = row.messageCount + 1;
        db.prepare(`
      UPDATE message_spam SET messageCount = ? WHERE userId = ?
    `).run(newCount, userId);

        // Check if exceeded
        return newCount > config.rateLimits.maxMessagesPerTenSeconds;

    } catch (error) {
        logger.error(`Error checking rate limit:`, error);
        return false;
    }
}
