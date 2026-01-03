/**
 * NEXUS Environment Discovery & Normalization
 * 
 * PRINCIPLE: If production posted successfully, credentials EXIST.
 * This module discovers and normalizes all credential sources.
 */

interface CredentialBinding {
    twitter: {
        appKey: string | undefined;
        appSecret: string | undefined;
        accessToken: string | undefined;
        accessSecret: string | undefined;
        source: string;
    } | null;
    reddit: {
        clientId: string | undefined;
        clientSecret: string | undefined;
        username: string | undefined;
        password: string | undefined;
        source: string;
    } | null;
}

// All known Twitter env var aliases
const TWITTER_KEY_ALIASES = [
    'TWITTER_API_KEY',
    'TWITTER_CONSUMER_KEY',
    'X_API_KEY',
    'TWITTER_APP_KEY',
];

const TWITTER_SECRET_ALIASES = [
    'TWITTER_API_SECRET',
    'TWITTER_CONSUMER_SECRET',
    'X_API_SECRET',
    'TWITTER_APP_SECRET',
];

const TWITTER_ACCESS_TOKEN_ALIASES = [
    'TWITTER_ACCESS_TOKEN',
    'X_ACCESS_TOKEN',
    'TWITTER_USER_TOKEN',
];

const TWITTER_ACCESS_SECRET_ALIASES = [
    'TWITTER_ACCESS_SECRET',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'X_ACCESS_SECRET',
    'X_ACCESS_TOKEN_SECRET',
];

// Reddit aliases
const REDDIT_CLIENT_ID_ALIASES = [
    'REDDIT_CLIENT_ID',
    'REDDIT_APP_ID',
];

const REDDIT_CLIENT_SECRET_ALIASES = [
    'REDDIT_CLIENT_SECRET',
    'REDDIT_SECRET',
];

const REDDIT_USERNAME_ALIASES = [
    'REDDIT_USERNAME',
    'REDDIT_USER',
];

const REDDIT_PASSWORD_ALIASES = [
    'REDDIT_PASSWORD',
    'REDDIT_PASS',
];

/**
 * Discover first available value from alias list
 */
function discoverEnvVar(aliases: string[]): { value: string | undefined; source: string } {
    for (const alias of aliases) {
        const value = process.env[alias];
        if (value && value.length > 5 && !isPlaceholder(value)) {
            return { value, source: alias };
        }
    }
    return { value: undefined, source: 'none' };
}

/**
 * Check if a value is a placeholder
 */
function isPlaceholder(value: string): boolean {
    const lower = value.toLowerCase();
    const placeholders = ['your-', 'xxx', 'placeholder', 'todo', 'changeme', 'mock', 'example', 'test'];
    return placeholders.some(p => lower.includes(p));
}

/**
 * Discover all available credentials
 * Maps aliases automatically - no manual configuration needed
 */
export function discoverCredentials(): CredentialBinding {
    console.log('[Env Discovery] Scanning for credentials...');

    // Twitter
    const appKey = discoverEnvVar(TWITTER_KEY_ALIASES);
    const appSecret = discoverEnvVar(TWITTER_SECRET_ALIASES);
    const accessToken = discoverEnvVar(TWITTER_ACCESS_TOKEN_ALIASES);
    const accessSecret = discoverEnvVar(TWITTER_ACCESS_SECRET_ALIASES);

    const hasTwitter = !!(appKey.value && appSecret.value && accessToken.value && accessSecret.value);

    // Reddit
    const clientId = discoverEnvVar(REDDIT_CLIENT_ID_ALIASES);
    const clientSecret = discoverEnvVar(REDDIT_CLIENT_SECRET_ALIASES);
    const username = discoverEnvVar(REDDIT_USERNAME_ALIASES);
    const password = discoverEnvVar(REDDIT_PASSWORD_ALIASES);

    const hasReddit = !!(clientId.value && clientSecret.value && username.value && password.value);

    // Log discovery
    console.log(`[Env Discovery] Twitter: ${hasTwitter ? `FOUND (via ${appKey.source})` : 'NOT FOUND'}`);
    console.log(`[Env Discovery] Reddit: ${hasReddit ? `FOUND (via ${clientId.source})` : 'NOT FOUND'}`);

    return {
        twitter: hasTwitter ? {
            appKey: appKey.value,
            appSecret: appSecret.value,
            accessToken: accessToken.value,
            accessSecret: accessSecret.value,
            source: appKey.source,
        } : null,
        reddit: hasReddit ? {
            clientId: clientId.value,
            clientSecret: clientSecret.value,
            username: username.value,
            password: password.value,
            source: clientId.source,
        } : null,
    };
}

/**
 * Get Twitter credentials (normalized)
 */
export function getTwitterCredentials(): {
    appKey: string;
    appSecret: string;
    accessToken: string;
    accessSecret: string;
} | null {
    const creds = discoverCredentials();
    if (!creds.twitter) return null;
    return {
        appKey: creds.twitter.appKey!,
        appSecret: creds.twitter.appSecret!,
        accessToken: creds.twitter.accessToken!,
        accessSecret: creds.twitter.accessSecret!,
    };
}

/**
 * Get Reddit credentials (normalized)
 */
export function getRedditCredentials(): {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
} | null {
    const creds = discoverCredentials();
    if (!creds.reddit) return null;
    return {
        clientId: creds.reddit.clientId!,
        clientSecret: creds.reddit.clientSecret!,
        username: creds.reddit.username!,
        password: creds.reddit.password!,
    };
}

/**
 * Log all Twitter-related env vars (for debugging)
 */
export function logEnvVars(): void {
    console.log('[Env Discovery] Scanning all env vars...');

    const allAliases = [
        ...TWITTER_KEY_ALIASES,
        ...TWITTER_SECRET_ALIASES,
        ...TWITTER_ACCESS_TOKEN_ALIASES,
        ...TWITTER_ACCESS_SECRET_ALIASES,
        ...REDDIT_CLIENT_ID_ALIASES,
        ...REDDIT_CLIENT_SECRET_ALIASES,
        ...REDDIT_USERNAME_ALIASES,
        ...REDDIT_PASSWORD_ALIASES,
    ];

    for (const alias of allAliases) {
        const value = process.env[alias];
        if (value) {
            console.log(`  ${alias}: ${value.substring(0, 8)}...*** (${value.length} chars)`);
        }
    }
}

export { CredentialBinding };
