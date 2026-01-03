/**
 * GG LOOP Desktop API Client
 * 
 * Handles communication with the GG LOOP backend for:
 * - Authentication
 * - Match verification
 * - Points sync
 */

const BASE_URL = process.env.GG_LOOP_API_URL || 'https://ggloop.io';

interface MatchData {
    gameId: string;
    gameName: string;
    startTime: string;
    endTime: string;
    sessionDuration: number;
}

interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        totalPoints: number;
    };
    error?: string;
}

interface VerifyResponse {
    success: boolean;
    pointsAwarded?: number;
    message?: string;
    error?: string;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${BASE_URL}/api/desktop/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Login failed' };
        }

        return { success: true, token: data.token, user: data.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Login with one-time code (sent via email/SMS)
 */
export async function loginWithCode(email: string, code: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${BASE_URL}/api/desktop/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Code verification failed' };
        }

        return { success: true, token: data.token, user: data.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Request a login code via email
 */
export async function requestLoginCode(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/api/desktop/request-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        return { success: response.ok, error: data.error };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Verify a completed match and earn points
 */
export async function verifyMatch(token: string, matchData: MatchData): Promise<VerifyResponse> {
    try {
        const response = await fetch(`${BASE_URL}/api/desktop/verify-match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(matchData)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Verification failed' };
        }

        return {
            success: true,
            pointsAwarded: data.pointsAwarded,
            message: data.message
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get user's current points balance
 */
export async function getBalance(token: string): Promise<{ points: number; error?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/api/desktop/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        return { points: data.totalPoints || 0 };
    } catch (error: any) {
        return { points: 0, error: error.message };
    }
}

/**
 * CRITICAL: Fetch current user info for account binding
 * This MUST succeed before points can accrue
 */
export interface UserInfo {
    id: string;
    username: string;
    email: string;
    totalPoints: number;
    isFounder?: boolean;
    tier?: string;
}

export async function getMe(token: string): Promise<{ success: boolean; user?: UserInfo; error?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/api/me`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.error || `Auth failed (${response.status})` };
        }

        const data = await response.json();
        return { 
            success: true, 
            user: {
                id: data.id || data.userId,
                username: data.username || data.displayName || data.email?.split('@')[0] || 'Unknown',
                email: data.email,
                totalPoints: data.totalPoints || 0,
                isFounder: data.isFounder,
                tier: data.tier
            }
        };
    } catch (error: any) {
        console.error('[API] getMe error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync pending matches (offline buffer)
 */
export async function syncPendingMatches(
    token: string,
    matches: MatchData[]
): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    for (const match of matches) {
        const result = await verifyMatch(token, match);
        if (result.success) {
            synced++;
        } else {
            failed++;
        }
    }

    return { synced, failed };
}

module.exports = {
    login,
    loginWithCode,
    requestLoginCode,
    verifyMatch,
    getBalance,
    syncPendingMatches
};
