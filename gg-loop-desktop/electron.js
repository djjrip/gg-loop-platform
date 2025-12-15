const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { detectGame, monitorGames } = require('./gameDetection');

let mainWindow;
let gameMonitorCleanup = null;

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

    // Load app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Start game monitoring
    startGameMonitoring();
}

function startGameMonitoring() {
    if (gameMonitorCleanup) {
        gameMonitorCleanup();
    }

    gameMonitorCleanup = monitorGames(
        (game) => {
            // Game detected
            if (mainWindow) {
                mainWindow.webContents.send('game-detected', game);
            }
        },
        (game) => {
            // Game closed
            if (mainWindow) {
                mainWindow.webContents.send('game-closed', game);
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
    // TODO: Implement secure token storage (electron-store)
    return null;
});

ipcMain.handle('set-auth-token', async (event, token) => {
    // TODO: Implement secure token storage
    return true;
});

ipcMain.handle('clear-auth', async () => {
    // TODO: Implement secure token removal
    return true;
});

ipcMain.handle('get-system-info', async () => {
    return {
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion()
    };
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
