const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { detectGame, monitorGames } = require('./gameDetection');
const sessionSync = require('./sessionSync');

let mainWindow;
let gameMonitorCleanup = null;

// Make mainWindow globally accessible for sessionSync notifications
global.mainWindow = null;

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
            sandbox: true
        },
        backgroundColor: '#0d0907',
        title: 'GG Loop Desktop - Gameplay Verification'
    });

    // Make accessible globally for sessionSync
    global.mainWindow = mainWindow;

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
    const store = new Store({ name: 'gg-loop-session', encryptionKey: 'gg-loop-secure-key' });
    return store.get('authToken', null);
});

ipcMain.handle('set-auth-token', async (event, token) => {
    sessionSync.setAuthToken(token);
    return true;
});

ipcMain.handle('clear-auth', async () => {
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
