const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { detectGame, monitorGames } = require('./gameDetection');
const { startVerificationLoop, setVerifiedUser, clearUser, getVerificationState } = require('./gameVerification');
const sessionSync = require('./sessionSync');
const crypto = require('crypto');

let mainWindow;
let gameMonitorCleanup = null;
let verificationCleanup = null;

// API configuration
const API_BASE_URL = 'https://ggloop.io';

// Make mainWindow globally accessible for sessionSync notifications
global.mainWindow = null;

// Auto-updater configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Log updater events
autoUpdater.on('checking-for-update', () => {
    console.log('[Auto-Updater] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    console.log('[Auto-Updater] Update available:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', info);
    }
});

autoUpdater.on('update-not-available', () => {
    console.log('[Auto-Updater] App is up to date');
});

autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', progress);
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('[Auto-Updater] Update downloaded, will install on quit');
    if (mainWindow) {
        mainWindow.webContents.send('update-ready', info);
    }
});

autoUpdater.on('error', (err) => {
    console.error('[Auto-Updater] Error:', err);
});

// Generate device-specific encryption key
function getDeviceEncryptionKey() {
    const Store = require('electron-store');
    const tempStore = new Store({ name: 'gg-loop-device' });

    let deviceKey = tempStore.get('deviceKey');
    if (!deviceKey) {
        // Generate unique key for this device
        deviceKey = crypto.randomBytes(32).toString('hex');
        tempStore.set('deviceKey', deviceKey);
    }

    return deviceKey;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            enableRemoteModule: false, // Security: Disable remote
            webSecurity: true, // Enforce web security
            allowRunningInsecureContent: false
        },
        backgroundColor: '#0d0907',
        title: 'GG Loop Desktop - Gameplay Verification'
    });

    // Make accessible globally for sessionSync
    global.mainWindow = mainWindow;

    // Enhanced security: Set CSP headers
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https:; " +
                    "connect-src 'self' https://ggloop.io https://api.ggloop.io"
                ]
            }
        });
    });

    // Load app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        global.mainWindow = null;
    });

    // Start game monitoring
    startGameMonitoring();

    // Sync any pending sessions from previous runs
    sessionSync.syncPendingSessions();

    // Check for updates on launch (once per day)
    if (!process.env.NODE_ENV) {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 3000); // Wait 3s after launch
    }
}

function startGameMonitoring() {
    // Clean up old monitors
    if (gameMonitorCleanup) {
        gameMonitorCleanup();
    }
    if (verificationCleanup) {
        verificationCleanup();
    }

    // Start new verification-based monitoring (game + foreground detection)
    verificationCleanup = startVerificationLoop((state) => {
        // Send verification state to renderer
        if (mainWindow) {
            mainWindow.webContents.send('verification-state-change', state);
        }

        // CRITICAL: Track active play time based on foreground detection
        const isActivePlay = state.state === 'ACTIVE_PLAY_CONFIRMED';
        sessionSync.updateActivePlayTime(isActivePlay);

        // Handle session tracking based on verification state
        if (isActivePlay && state.gameName) {
            // Start/continue session only when actively playing
            if (!sessionSync.getCurrentSession()) {
                console.log('[Electron] Active play confirmed:', state.gameName);
                sessionSync.startSession({
                    name: state.gameName,
                    gameId: state.gameProcess,
                    process: state.gameProcess,
                    icon: state.gameIcon
                });
                
                if (mainWindow) {
                    mainWindow.webContents.send('game-detected', {
                        name: state.gameName,
                        icon: state.gameIcon
                    });
                }
            }
        } else if (state.state === 'NOT_PLAYING' && sessionSync.getCurrentSession()) {
            // Game closed - end session
            endCurrentSession();
        }
    }, 3000); // Check every 3 seconds

    // Also keep legacy game monitor for session end detection
    gameMonitorCleanup = monitorGames(
        (game) => {
            // Game detected (legacy event)
            console.log('[Electron] Game process detected:', game.name);
        },
        async (game) => {
            // Game closed - end session and sync
            await endCurrentSession(game);
        },
        5000
    );
}

async function endCurrentSession(game) {
    const session = sessionSync.getCurrentSession();
    if (!session) return;

    console.log('[Electron] Game closed:', game?.name || session.gameName);

    const result = await sessionSync.endSession();
    console.log('[Electron] Session sync result:', result);

    if (mainWindow) {
        mainWindow.webContents.send('game-closed', game || { name: session.gameName });

        if (result && result.success) {
            mainWindow.webContents.send('points-awarded', {
                points: result.pointsAwarded,
                game: session.gameName
            });
        }
    }
}

// IPC Handlers
ipcMain.handle('detect-game', async () => {
    return await detectGame();
});

ipcMain.handle('get-auth-token', async () => {
    const Store = require('electron-store');
    const store = new Store({
        name: 'gg-loop-session',
        encryptionKey: getDeviceEncryptionKey() // Device-specific encryption
    });
    return store.get('authToken', null);
});

ipcMain.handle('set-auth-token', async (event, token) => {
    const Store = require('electron-store');
    const store = new Store({
        name: 'gg-loop-session',
        encryptionKey: getDeviceEncryptionKey()
    });
    store.set('authToken', token);
    sessionSync.setAuthToken(token);
    return true;
});

ipcMain.handle('clear-auth', async () => {
    const Store = require('electron-store');
    const store = new Store({
        name: 'gg-loop-session',
        encryptionKey: getDeviceEncryptionKey()
    });
    store.clear();
    sessionSync.clearAuth();
    clearUser(); // Clear verification user binding
    return true;
});

// CRITICAL: Fetch user info for account binding
ipcMain.handle('get-me', async () => {
    const Store = require('electron-store');
    const store = new Store({
        name: 'gg-loop-session',
        encryptionKey: getDeviceEncryptionKey()
    });
    
    const token = store.get('authToken');
    if (!token) {
        return { success: false, error: 'No auth token' };
    }

    try {
        const fetch = require('node-fetch');
        const response = await fetch(`${API_BASE_URL}/api/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return { success: false, error: `Auth failed (${response.status})` };
        }

        const data = await response.json();
        const user = {
            id: data.id || data.userId,
            username: data.username || data.displayName || data.email?.split('@')[0] || 'Unknown',
            email: data.email,
            totalPoints: data.totalPoints || 0,
            isFounder: data.isFounder,
            tier: data.tier
        };

        // Bind user to verification system
        setVerifiedUser(user.id, user.username);
        
        console.log(`[Electron] Account bound: ${user.username} (${user.id})`);
        return { success: true, user };
    } catch (error) {
        console.error('[Electron] getMe error:', error);
        return { success: false, error: error.message };
    }
});

// Open external URL (for OAuth)
ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
});

ipcMain.handle('get-system-info', async () => {
    return {
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion()
    };
});

ipcMain.handle('get-session-info', async () => {
    return sessionSync.getCurrentSession();
});

ipcMain.handle('sync-pending', async () => {
    return await sessionSync.syncPendingSessions();
});

// Updater controls
ipcMain.handle('check-for-updates', async () => {
    try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, updateInfo: result.updateInfo };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (gameMonitorCleanup) {
        gameMonitorCleanup();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.protocol !== 'file:') {
            event.preventDefault();
        }
    });
});
