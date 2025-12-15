// Rate Limiting for Desktop Match Verification
// Prevents spam and abuse of the verification system

interface VerificationAttempt {
    userId: string;
    timestamp: number;
    matchId: string;
}

// In-memory storage (should be Redis in production)
const verificationHistory: Map<string, VerificationAttempt[]> = new Map();

const RATE_LIMITS = {
    MAX_MATCHES_PER_DAY: 20,
    COOLDOWN_MINUTES: 5,
    VELOCITY_WINDOW_MINUTES: 60,
    MAX_VELOCITY: 10 // Max matches per hour
};

/**
 * Check if user has exceeded rate limits
 */
export function checkRateLimit(userId: string, matchId: string): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
} {
    const now = Date.now();
    const userHistory = verificationHistory.get(userId) || [];

    // Clean old entries (older than 24 hours)
    const last24Hours = userHistory.filter(
        attempt => now - attempt.timestamp < 24 * 60 * 60 * 1000
    );

    // Check daily limit
    if (last24Hours.length >= RATE_LIMITS.MAX_MATCHES_PER_DAY) {
        const oldestAttempt = last24Hours[0];
        const retryAfter = oldestAttempt.timestamp + (24 * 60 * 60 * 1000) - now;

        return {
            allowed: false,
            reason: `Daily limit reached (${RATE_LIMITS.MAX_MATCHES_PER_DAY} matches/day)`,
            retryAfter: Math.ceil(retryAfter / 1000 / 60) // minutes
        };
    }

    // Check cooldown (time since last verification)
    if (last24Hours.length > 0) {
        const lastAttempt = last24Hours[last24Hours.length - 1];
        const timeSinceLastMs = now - lastAttempt.timestamp;
        const cooldownMs = RATE_LIMITS.COOLDOWN_MINUTES * 60 * 1000;

        if (timeSinceLastMs < cooldownMs) {
            const retryAfter = Math.ceil((cooldownMs - timeSinceLastMs) / 1000 / 60);

            return {
                allowed: false,
                reason: `Cooldown active (${RATE_LIMITS.COOLDOWN_MINUTES} min between matches)`,
                retryAfter
            };
        }
    }

    // Check velocity (matches per hour)
    const lastHour = userHistory.filter(
        attempt => now - attempt.timestamp < 60 * 60 * 1000
    );

    if (lastHour.length >= RATE_LIMITS.MAX_VELOCITY) {
        return {
            allowed: false,
            reason: `Velocity limit exceeded (max ${RATE_LIMITS.MAX_VELOCITY} matches/hour)`,
            retryAfter: 60 // Wait an hour
        };
    }

    // Check for duplicate match ID
    const isDuplicate = last24Hours.some(attempt => attempt.matchId === matchId);
    if (isDuplicate) {
        return {
            allowed: false,
            reason: 'Match already verified'
        };
    }

    return { allowed: true };
}

/**
 * Record a verification attempt
 */
export function recordVerification(userId: string, matchId: string): void {
    const userHistory = verificationHistory.get(userId) || [];

    userHistory.push({
        userId,
        timestamp: Date.now(),
        matchId
    });

    // Keep only last 24 hours
    const last24Hours = userHistory.filter(
        attempt => Date.now() - attempt.timestamp < 24 * 60 * 60 * 1000
    );

    verificationHistory.set(userId, last24Hours);
}

/**
 * Get user's verification stats
 */
export function getVerificationStats(userId: string) {
    const now = Date.now();
    const userHistory = verificationHistory.get(userId) || [];

    const last24Hours = userHistory.filter(
        attempt => now - attempt.timestamp < 24 * 60 * 60 * 1000
    );

    const lastHour = userHistory.filter(
        attempt => now - attempt.timestamp < 60 * 60 * 1000
    );

    return {
        matchesToday: last24Hours.length,
        matchesThisHour: lastHour.length,
        dailyLimit: RATE_LIMITS.MAX_MATCHES_PER_DAY,
        remainingToday: Math.max(0, RATE_LIMITS.MAX_MATCHES_PER_DAY - last24Hours.length),
        lastVerification: last24Hours.length > 0
            ? new Date(last24Hours[last24Hours.length - 1].timestamp).toISOString()
            : null
    };
}

/**
 * Admin: Reset user's rate limit
 */
export function resetUserRateLimit(userId: string): void {
    verificationHistory.delete(userId);
}

/**
 * Admin: Get all users with suspicious activity
 */
export function getSuspiciousUsers(): Array<{
    userId: string;
    matchCount: number;
    velocity: number;
    flagReason: string;
}> {
    const now = Date.now();
    const suspicious: Array<any> = [];

    for (const [userId, history] of verificationHistory.entries()) {
        const last24Hours = history.filter(
            attempt => now - attempt.timestamp < 24 * 60 * 60 * 1000
        );

        const lastHour = history.filter(
            attempt => now - attempt.timestamp < 60 * 60 * 1000
        );

        // Flag if near limits or showing suspicious patterns
        if (last24Hours.length >= RATE_LIMITS.MAX_MATCHES_PER_DAY * 0.8) {
            suspicious.push({
                userId,
                matchCount: last24Hours.length,
                velocity: lastHour.length,
                flagReason: 'Near daily limit'
            });
        } else if (lastHour.length >= RATE_LIMITS.MAX_VELOCITY * 0.8) {
            suspicious.push({
                userId,
                matchCount: last24Hours.length,
                velocity: lastHour.length,
                flagReason: 'High velocity'
            });
        }
    }

    return suspicious.sort((a, b) => b.matchCount - a.matchCount);
}
