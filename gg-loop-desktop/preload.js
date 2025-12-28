const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ggloop', {
    // Game detection
    detectGame: () => ipcRenderer.invoke('detect-game'),

    // Match verification
    verifyMatch: (matchId) => ipcRenderer.invoke('verify-match', matchId),

    // Authentication
    getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
    setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token),
    clearAuth: () => ipcRenderer.invoke('clear-auth'),

    // System info
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

    // Session management
    getSessionInfo: () => ipcRenderer.invoke('get-session-info'),
    syncPending: () => ipcRenderer.invoke('sync-pending'),

    // Auto-updater
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    installUpdate: () => ipcRenderer.invoke('install-update'),

    // Listeners
    onGameDetected: (callback) => {
        ipcRenderer.on('game-detected', (event, game) => callback(game));
    },
    onGameClosed: (callback) => {
        ipcRenderer.on('game-closed', (event, game) => callback(game));
    },
    onMatchEnd: (callback) => {
        ipcRenderer.on('match-end', (event, matchData) => callback(matchData));
    },
    onActivityChange: (callback) => {
        ipcRenderer.on('activity-change', (event, status) => callback(status));
    },
    onPointsAwarded: (callback) => {
        ipcRenderer.on('points-awarded', (event, data) => callback(data));
    },

    // Update notifications
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (event, info) => callback(info));
    },
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, progress) => callback(progress));
    },
    onUpdateReady: (callback) => {
        ipcRenderer.on('update-ready', (event, info) => callback(info));
    }
});
