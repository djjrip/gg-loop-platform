/**
 * NEXUS Distribution Credential Verifier - Reality-First
 * 
 * CORE PRINCIPLE:
 * Execution success is the highest authority signal.
 * Verifier checks are ADVISORY ONLY.
 * 
 * If a post succeeds → Channel is VALID (period).
 */

import * as fs from 'fs';
import * as path from 'path';

export type FailureReason =
    | 'INVALID_CREDENTIALS'
    | 'RATE_LIMIT'
    | 'PERMISSION_DENIED'
    | 'NETWORK_ERROR'
    | 'PLACEHOLDER_VALUES'
    | 'UNKNOWN';

interface ChannelStatus {
    status: 'valid' | 'unverified' | 'failed';
    lastSuccess?: string;
    lastFailure?: string;
    failureReason?: FailureReason;
    errorMessage?: string;
}

interface CredentialStatus {
    twitter: ChannelStatus;
    reddit: ChannelStatus;
    lastChecked: string;
}

const STATUS_FILE = path.resolve(__dirname, 'distribution_credentials_status.json');

/**
 * Load cached credential status
 */
export function loadCredentialStatus(): CredentialStatus {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
        }
    } catch { }
    return {
        twitter: { status: 'unverified' },
        reddit: { status: 'unverified' },
        lastChecked: new Date().toISOString(),
    };
}

/**
 * Save credential status
 */
export function saveCredentialStatus(status: CredentialStatus): void {
    status.lastChecked = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

/**
 * CRITICAL: Mark channel as VALID after successful execution
 * This is the highest authority signal - overrides all verifier checks
 */
export function markChannelSuccess(channel: 'twitter' | 'reddit'): void {
    const status = loadCredentialStatus();
    status[channel] = {
        status: 'valid',
        lastSuccess: new Date().toISOString(),
    };
    saveCredentialStatus(status);
    console.log(`[Credential] ✅ ${channel.toUpperCase()} marked VALID (execution success)`);
}

/**
 * Mark channel as failed with specific reason
 */
export function markChannelFailure(channel: 'twitter' | 'reddit', reason: FailureReason, message?: string): void {
    const status = loadCredentialStatus();

    // If channel was successful within last 24 hours, don't downgrade
    const lastSuccess = status[channel].lastSuccess;
    if (lastSuccess) {
        const hoursSince = (Date.now() - new Date(lastSuccess).getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            console.log(`[Credential] ${channel.toUpperCase()} failed but was successful ${hoursSince.toFixed(1)}h ago - keeping VALID`);
            return;
        }
    }

    status[channel] = {
        status: 'failed',
        lastFailure: new Date().toISOString(),
        failureReason: reason,
        errorMessage: message?.substring(0, 100),
    };
    saveCredentialStatus(status);
    console.log(`[Credential] ❌ ${channel.toUpperCase()} marked FAILED: ${reason}`);
}

/**
 * Classify error into failure reason
 */
export function classifyError(error: any): FailureReason {
    const msg = (error?.message || error?.toString() || '').toLowerCase();

    if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid') || msg.includes('credentials')) {
        return 'INVALID_CREDENTIALS';
    }
    if (msg.includes('429') || msg.includes('rate') || msg.includes('limit') || msg.includes('too many')) {
        return 'RATE_LIMIT';
    }
    if (msg.includes('403') || msg.includes('forbidden') || msg.includes('permission')) {
        return 'PERMISSION_DENIED';
    }
    if (msg.includes('network') || msg.includes('econnrefused') || msg.includes('timeout') || msg.includes('enotfound')) {
        return 'NETWORK_ERROR';
    }
    return 'UNKNOWN';
}

/**
 * Check if a value is a placeholder (not real credential)
 */
function isPlaceholder(value: string | undefined): boolean {
    if (!value) return true;
    const placeholders = ['your-', 'xxx', 'placeholder', 'todo', 'changeme', 'mock', 'example'];
    const lower = value.toLowerCase();
    return placeholders.some(p => lower.includes(p)) || value.length < 10;
}

/**
 * REALITY-FIRST: Check if channel should be trusted
 * Trusts execution history over verifier checks
 */
export function isChannelTrusted(channel: 'twitter' | 'reddit'): boolean {
    const status = loadCredentialStatus();
    const channelStatus = status[channel];

    // If marked valid (execution success), trust it
    if (channelStatus.status === 'valid') {
        return true;
    }

    // If successful within last 24 hours, trust it
    if (channelStatus.lastSuccess) {
        const hoursSince = (Date.now() - new Date(channelStatus.lastSuccess).getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            return true;
        }
    }

    return false;
}

/**
 * Get available channels (execution-validated OR has credentials)
 */
export function getAvailableChannels(): ('twitter' | 'reddit')[] {
    const channels: ('twitter' | 'reddit')[] = [];

    // Check Twitter
    if (isChannelTrusted('twitter') || hasTwitterCredentials()) {
        channels.push('twitter');
    }

    // Check Reddit
    if (isChannelTrusted('reddit') || hasRedditCredentials()) {
        channels.push('reddit');
    }

    return channels;
}

/**
 * Check if Twitter credentials exist (not placeholders)
 */
function hasTwitterCredentials(): boolean {
    const appKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CONSUMER_KEY;
    const appSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CONSUMER_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    return !!(appKey && appSecret && accessToken && accessSecret &&
        !isPlaceholder(appKey) && !isPlaceholder(appSecret) &&
        !isPlaceholder(accessToken) && !isPlaceholder(accessSecret));
}

/**
 * Check if Reddit credentials exist (not placeholders)
 */
function hasRedditCredentials(): boolean {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;

    return !!(clientId && clientSecret && username && password &&
        !isPlaceholder(clientId) && !isPlaceholder(clientSecret) &&
        !isPlaceholder(username) && !isPlaceholder(password));
}

/**
 * Get status summary for Founder Desktop App
 */
export function getStatusForFounder(): string {
    const status = loadCredentialStatus();
    const parts: string[] = [];

    // Twitter
    if (status.twitter.status === 'valid') {
        parts.push('Twitter: Active');
    } else if (status.twitter.status === 'failed') {
        parts.push(`Twitter: ${status.twitter.failureReason || 'Failed'}`);
    } else {
        parts.push('Twitter: Unverified');
    }

    // Reddit
    if (status.reddit.status === 'valid') {
        parts.push('Reddit: Active');
    } else if (status.reddit.status === 'failed') {
        parts.push(`Reddit: ${status.reddit.failureReason || 'Failed'}`);
    } else {
        parts.push('Reddit: Unverified');
    }

    return parts.join(' | ');
}

/**
 * Quick verify - no network calls, just checks state
 */
export function quickVerify(): { twitter: boolean; reddit: boolean } {
    return {
        twitter: isChannelTrusted('twitter') || hasTwitterCredentials(),
        reddit: isChannelTrusted('reddit') || hasRedditCredentials(),
    };
}
