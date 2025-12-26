/**
 * GG LOOP Session Sync
 * 
 * Automatically syncs gameplay sessions to ggloop.io when games close.
 * This is the critical bridge between desktop app and backend points.
 */

const Store = require('electron-store');
const { verifyMatch, getBalance } = require('./api');

const store = new Store({
    name: 'gg-loop-session',
    encryptionKey: 'gg-loop-secure-key'
});

// Current session state
let currentSession = null;
let sessionStartTime = null;
let inputData = {
    totalInputs: 0,
    wasdCount: 0,
    mouseMovement: 0,
    clickCount: 0
};

/**
 * Start tracking a game session
 */
function startSession(gameInfo) {
    currentSession = {
        gameId: gameInfo.steamAppId || gameInfo.gameId || 'unknown',
        gameName: gameInfo.name,
        startTime: new Date().toISOString()
    };
    sessionStartTime = Date.now();
    inputData = { totalInputs: 0, wasdCount: 0, mouseMovement: 0, clickCount: 0 };

    console.log('[SessionSync] Session started:', currentSession.gameName);
}

/**
 * Update input tracking (called periodically by inputCapture)
 */
function updateInputData(data) {
    inputData.totalInputs += data.totalInputs || 0;
    inputData.wasdCount += data.wasdCount || 0;
    inputData.mouseMovement += data.mouseMovement || 0;
    inputData.clickCount += data.clickCount || 0;
}

/**
 * End session and sync to backend
 */
async function endSession() {
    if (!currentSession) {
        console.log('[SessionSync] No active session to end');
        return null;
    }

    const endTime = new Date().toISOString();
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Create match data for verification
    const matchData = {
        gameId: currentSession.gameId,
        gameName: currentSession.gameName,
        startTime: currentSession.startTime,
        endTime: endTime,
        sessionDuration: sessionDuration,
        inputData: { ...inputData }
    };

    console.log('[SessionSync] Session ended:', matchData);

    // Get stored auth token
    const token = store.get('authToken');

    if (!token) {
        console.log('[SessionSync] No auth token - saving session for later sync');
        savePendingSession(matchData);
        currentSession = null;
        return { success: false, reason: 'not_authenticated' };
    }

    // Minimum session requirement: 5 minutes and some input
    if (sessionDuration < 300 || inputData.totalInputs < 100) {
        console.log('[SessionSync] Session too short or not enough input');
        currentSession = null;
        return { success: false, reason: 'insufficient_activity', sessionDuration, inputCount: inputData.totalInputs };
    }

    // Sync to backend
    try {
        const result = await verifyMatch(token, matchData);

        if (result.success) {
            console.log('[SessionSync] Points awarded:', result.pointsAwarded);

            // Emit event for UI notification
            if (global.mainWindow) {
                global.mainWindow.webContents.send('points-awarded', {
                    points: result.pointsAwarded,
                    game: matchData.gameName
                });
            }
        } else {
            console.error('[SessionSync] Verification failed:', result.error);
            savePendingSession(matchData);
        }

        currentSession = null;
        return result;
    } catch (error) {
        console.error('[SessionSync] Sync error:', error);
        savePendingSession(matchData);
        currentSession = null;
        return { success: false, error: error.message };
    }
}

/**
 * Save session for later sync (offline support)
 */
function savePendingSession(matchData) {
    const pending = store.get('pendingMatches', []);
    pending.push(matchData);
    store.set('pendingMatches', pending);
    console.log('[SessionSync] Saved pending session. Total pending:', pending.length);
}

/**
 * Sync all pending sessions (called on app start or when auth completes)
 */
async function syncPendingSessions() {
    const token = store.get('authToken');
    if (!token) return { synced: 0, failed: 0 };

    const pending = store.get('pendingMatches', []);
    if (pending.length === 0) return { synced: 0, failed: 0 };

    console.log('[SessionSync] Syncing', pending.length, 'pending sessions');

    let synced = 0;
    let failed = 0;
    const stillPending = [];

    for (const match of pending) {
        try {
            const result = await verifyMatch(token, match);
            if (result.success) {
                synced++;
            } else {
                stillPending.push(match);
                failed++;
            }
        } catch (error) {
            stillPending.push(match);
            failed++;
        }
    }

    store.set('pendingMatches', stillPending);
    console.log('[SessionSync] Sync complete. Synced:', synced, 'Failed:', failed);

    return { synced, failed };
}

/**
 * Store auth token after login
 */
function setAuthToken(token) {
    store.set('authToken', token);
    console.log('[SessionSync] Auth token saved');

    // Try to sync any pending sessions
    syncPendingSessions();
}

/**
 * Clear auth on logout
 */
function clearAuth() {
    store.delete('authToken');
    console.log('[SessionSync] Auth cleared');
}

/**
 * Get current session info
 */
function getCurrentSession() {
    if (!currentSession) return null;

    return {
        ...currentSession,
        duration: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0,
        inputData: { ...inputData }
    };
}

module.exports = {
    startSession,
    endSession,
    updateInputData,
    syncPendingSessions,
    setAuthToken,
    clearAuth,
    getCurrentSession
};
