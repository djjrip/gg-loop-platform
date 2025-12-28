const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { detectGame, monitorGames } = require('./gameDetection');
const sessionSync = require('./sessionSync');
const crypto = require('crypto');

let mainWindow;
let gameMonitorCleanup = null;

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
    if (gameMonitorCleanup) {
        gameMonitorCleanup();
    }

    gameMonitorCleanup = monitorGames(
        (game) => {
            // Game detected - start session tracking
            console.log('[Electron] Game detected:', game.name);
            sessionSync.startSession(game);

            if (mainWindow) {
                mainWindow.webContents.send('game-detected', game);
            }
        },
        async (game) => {
            // Game closed - end session and sync to backend
            console.log('[Electron] Game closed:', game.name);

            // End session and sync points
            const result = await sessionSync.endSession();
            console.log('[Electron] Session sync result:', result);

            if (mainWindow) {
                mainWindow.webContents.send('game-closed', game);

                // Send sync result to UI
                if (result && result.success) {
                    mainWindow.webContents.send('points-awarded', {
                        points: result.pointsAwarded,
                        game: game.name
                    });
                }
            }
        },
        5000 // Poll every 5 seconds
    );
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
