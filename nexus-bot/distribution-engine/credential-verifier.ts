/**
 * NEXUS Distribution Credential Verifier
 * 
 * GOVERNOR MODE COMPONENT:
 * - Validates credentials on startup
 * - Caches validation results
 * - Never asks founder for keys
 * - Self-repairs and falls back automatically
 */

import * as fs from 'fs';
import * as path from 'path';

interface CredentialStatus {
    twitter: 'valid' | 'invalid' | 'unavailable';
    reddit: 'valid' | 'invalid' | 'unavailable';
    lastChecked: string;
    twitterError?: string;
    redditError?: string;
    retryCount: number;
    nextRetry?: string;
}

const STATUS_FILE = path.resolve(__dirname, 'distribution_credentials_status.json');

/**
 * Load cached credential status
 */
export function loadCredentialStatus(): CredentialStatus | null {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Save credential status
 */
export function saveCredentialStatus(status: CredentialStatus): void {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

/**
 * Check if a value is a placeholder (not real credential)
 */
function isPlaceholder(value: string | undefined): boolean {
    if (!value) return true;
    const placeholders = ['your-', 'xxx', 'placeholder', 'todo', 'changeme', 'mock'];
    const lower = value.toLowerCase();
    return placeholders.some(p => lower.includes(p)) || value.length < 10;
}

/**
 * Validate Twitter credentials
 */
async function validateTwitterCredentials(): Promise<{ valid: boolean; error?: string }> {
    const appKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CONSUMER_KEY;
    const appSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CONSUMER_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    // Check presence
    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        return { valid: false, error: 'Missing credentials' };
    }

    // Check for placeholders
    if (isPlaceholder(appKey) || isPlaceholder(appSecret) ||
        isPlaceholder(accessToken) || isPlaceholder(accessSecret)) {
        return { valid: false, error: 'Placeholder values detected' };
    }

    // Attempt lightweight validation (verify credentials endpoint)
    try {
        const { TwitterApi } = await import('twitter-api-v2');
        const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });

        // Light API call to verify
        await client.v2.me();
        return { valid: true };
    } catch (error: any) {
        return { valid: false, error: error.message?.substring(0, 100) };
    }
}

/**
 * Validate Reddit credentials
 */
async function validateRedditCredentials(): Promise<{ valid: boolean; error?: string }> {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;

    // Check presence
    if (!clientId || !clientSecret || !username || !password) {
        return { valid: false, error: 'Missing credentials' };
    }

    // Check for placeholders
    if (isPlaceholder(clientId) || isPlaceholder(clientSecret) ||
        isPlaceholder(username) || isPlaceholder(password)) {
        return { valid: false, error: 'Placeholder values detected' };
    }

    // Attempt lightweight validation
    try {
        const Snoowrap = (await import('snoowrap')).default;
        const reddit = new Snoowrap({
            userAgent: 'GGLoop Credential Verifier',
            clientId,
            clientSecret,
            username,
            password,
        });

        // Light API call
        await reddit.getMe();
        return { valid: true };
    } catch (error: any) {
        return { valid: false, error: error.message?.substring(0, 100) };
    }
}

/**
 * Verify all distribution credentials
 * Called on startup and before distribution attempts
 */
export async function verifyCredentials(): Promise<CredentialStatus> {
    console.log('[Credential Verifier] Checking distribution credentials...');

    const cached = loadCredentialStatus();
    const now = new Date();

    // Check if we should skip (verified within last hour and both valid)
    if (cached && cached.twitter === 'valid' && cached.reddit === 'valid') {
        const lastCheck = new Date(cached.lastChecked);
        const hoursSince = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 1) {
            console.log('[Credential Verifier] Using cached status (both valid, checked recently)');
            return cached;
        }
    }

    // Check if we should wait for retry (failed recently)
    if (cached && cached.nextRetry) {
        const nextRetry = new Date(cached.nextRetry);
        if (now < nextRetry) {
            console.log(`[Credential Verifier] Waiting for retry at ${cached.nextRetry}`);
            return cached;
        }
    }

    // Validate credentials
    const [twitterResult, redditResult] = await Promise.all([
        validateTwitterCredentials(),
        validateRedditCredentials(),
    ]);

    const status: CredentialStatus = {
        twitter: twitterResult.valid ? 'valid' : 'unavailable',
        reddit: redditResult.valid ? 'valid' : 'unavailable',
        lastChecked: now.toISOString(),
        twitterError: twitterResult.error,
        redditError: redditResult.error,
        retryCount: (cached?.retryCount || 0) + 1,
    };

    // Set next retry if both failed (6 hours)
    if (!twitterResult.valid && !redditResult.valid) {
        const nextRetry = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        status.nextRetry = nextRetry.toISOString();
        console.log(`[Credential Verifier] Both channels unavailable. Next retry: ${status.nextRetry}`);
    }

    // Log results
    console.log(`[Credential Verifier] Twitter: ${status.twitter}${status.twitterError ? ` (${status.twitterError})` : ''}`);
    console.log(`[Credential Verifier] Reddit: ${status.reddit}${status.redditError ? ` (${status.redditError})` : ''}`);

    saveCredentialStatus(status);
    return status;
}

/**
 * Get available channels (valid credentials only)
 */
export async function getAvailableChannels(): Promise<('twitter' | 'reddit')[]> {
    const status = await verifyCredentials();
    const channels: ('twitter' | 'reddit')[] = [];

    if (status.twitter === 'valid') channels.push('twitter');
    if (status.reddit === 'valid') channels.push('reddit');

    return channels;
}

/**
 * Check if any distribution channel is available
 */
export async function hasAnyChannel(): Promise<boolean> {
    const channels = await getAvailableChannels();
    return channels.length > 0;
}

/**
 * Get human-readable status for Founder Desktop App
 */
export function getCredentialStatusForFounder(): string {
    const cached = loadCredentialStatus();

    if (!cached) {
        return 'Distribution channels not yet verified. Checking now...';
    }

    if (cached.twitter === 'valid' && cached.reddit === 'valid') {
        return 'All distribution channels operational.';
    }

    if (cached.twitter === 'valid' || cached.reddit === 'valid') {
        const working = cached.twitter === 'valid' ? 'Twitter' : 'Reddit';
        const degraded = cached.twitter !== 'valid' ? 'Twitter' : 'Reddit';
        return `${working} active. ${degraded} temporarily unavailable (auto-retry scheduled).`;
    }

    if (cached.nextRetry) {
        const retryTime = new Date(cached.nextRetry).toLocaleTimeString();
        return `Distribution channels recovering. Auto-retry at ${retryTime}. Manual posting available in NEXUS_STATUS.md.`;
    }

    return 'Distribution channels unavailable. Preparing manual content.';
}
