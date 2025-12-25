const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * GG LOOP Game Detection Module
 * 
 * Supports:
 * - Valorant
 * - League of Legends
 * - Popular Steam Games (CS2, Dota 2, Apex, etc.)
 * - Fortnite
 * - Overwatch
 * - More games by request
 */

// All supported games with their process names
const GAME_PROCESSES = {
    // === RIOT GAMES ===
    valorant: {
        name: 'Valorant',
        studio: 'Riot Games',
        processes: ['VALORANT.exe', 'VALORANT-Win64-Shipping.exe'],
        icon: '🎯',
        category: 'fps',
        steamAppId: null
    },
    league: {
        name: 'League of Legends',
        studio: 'Riot Games',
        processes: ['LeagueClientUx.exe', 'LeagueClient.exe', 'League of Legends.exe'],
        icon: '⚔️',
        category: 'moba',
        steamAppId: null
    },

    // === STEAM GAMES ===
    cs2: {
        name: 'Counter-Strike 2',
        studio: 'Valve',
        processes: ['cs2.exe'],
        icon: '🔫',
        category: 'fps',
        steamAppId: 730
    },
    dota2: {
        name: 'Dota 2',
        studio: 'Valve',
        processes: ['dota2.exe'],
        icon: '🧙',
        category: 'moba',
        steamAppId: 570
    },
    apex: {
        name: 'Apex Legends',
        studio: 'Respawn',
        processes: ['r5apex.exe', 'r5apex_dx12.exe'],
        icon: '🔥',
        category: 'fps',
        steamAppId: 1172470
    },
    pubg: {
        name: 'PUBG',
        studio: 'Krafton',
        processes: ['TslGame.exe'],
        icon: '🎖️',
        category: 'fps',
        steamAppId: 578080
    },
    rocketleague: {
        name: 'Rocket League',
        studio: 'Psyonix',
        processes: ['RocketLeague.exe'],
        icon: '🚗',
        category: 'sports',
        steamAppId: 252950
    },
    tf2: {
        name: 'Team Fortress 2',
        studio: 'Valve',
        processes: ['hl2.exe'],
        icon: '🎩',
        category: 'fps',
        steamAppId: 440
    },
    rust: {
        name: 'Rust',
        studio: 'Facepunch',
        processes: ['RustClient.exe', 'rust.exe'],
        icon: '🏚️',
        category: 'survival',
        steamAppId: 252490
    },
    deadbydaylight: {
        name: 'Dead by Daylight',
        studio: 'Behaviour',
        processes: ['DeadByDaylight-Win64-Shipping.exe'],
        icon: '👻',
        category: 'horror',
        steamAppId: 381210
    },
    destiny2: {
        name: 'Destiny 2',
        studio: 'Bungie',
        processes: ['destiny2.exe'],
        icon: '🌌',
        category: 'fps',
        steamAppId: 1085660
    },
    warframe: {
        name: 'Warframe',
        studio: 'Digital Extremes',
        processes: ['Warframe.exe', 'Warframe.x64.exe'],
        icon: '⚡',
        category: 'action',
        steamAppId: 230410
    },
    ark: {
        name: 'ARK: Survival Evolved',
        studio: 'Studio Wildcard',
        processes: ['ShooterGame.exe'],
        icon: '🦖',
        category: 'survival',
        steamAppId: 346110
    },
    gtav: {
        name: 'GTA V',
        studio: 'Rockstar',
        processes: ['GTA5.exe', 'PlayGTAV.exe'],
        icon: '🚔',
        category: 'action',
        steamAppId: 271590
    },

    // === OTHER PLATFORMS ===
    fortnite: {
        name: 'Fortnite',
        studio: 'Epic Games',
        processes: ['FortniteClient-Win64-Shipping.exe', 'FortniteLauncher.exe'],
        icon: '🏆',
        category: 'fps',
        steamAppId: null
    },
    overwatch: {
        name: 'Overwatch 2',
        studio: 'Blizzard',
        processes: ['Overwatch.exe'],
        icon: '🦸',
        category: 'fps',
        steamAppId: null
    },
    minecraft: {
        name: 'Minecraft',
        studio: 'Mojang',
        processes: ['javaw.exe'], // Note: May need refinement
        icon: '⛏️',
        category: 'sandbox',
        steamAppId: null
    },
    callofduty: {
        name: 'Call of Duty',
        studio: 'Activision',
        processes: ['cod.exe', 'ModernWarfare.exe', 'blackops.exe'],
        icon: '🎖️',
        category: 'fps',
        steamAppId: null
    },
};

/**
 * Detect running game processes on Windows
 * @returns {Promise<Object|null>} Detected game info or null
 */
async function detectGame() {
    try {
        // Use PowerShell to get process list
        const { stdout } = await execAsync(
            'powershell -Command "Get-Process | Select-Object -ExpandProperty ProcessName"',
            { timeout: 5000 }
        );

        const runningProcesses = stdout
            .split('\n')
            .map(p => p.trim().toLowerCase())
            .filter(Boolean);

        // Check all games
        for (const [gameId, game] of Object.entries(GAME_PROCESSES)) {
            for (const process of game.processes) {
                const processName = process.replace('.exe', '').toLowerCase();
                if (runningProcesses.includes(processName)) {
                    return {
                        id: gameId,
                        name: game.name,
                        studio: game.studio,
                        process: process,
                        icon: game.icon,
                        category: game.category,
                        steamAppId: game.steamAppId,
                        detectedAt: new Date().toISOString()
                    };
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Game detection error:', error);
        return null;
    }
}

/**
 * Monitor for game launch/close events
 */
function monitorGames(onDetected, onClosed, interval = 5000) {
    let lastDetectedGame = null;
    let sessionStart = null;

    const checkInterval = setInterval(async () => {
        const currentGame = await detectGame();

        // Game launched
        if (currentGame && !lastDetectedGame) {
            console.log(`[GG LOOP] Game detected: ${currentGame.name}`);
            lastDetectedGame = currentGame;
            sessionStart = Date.now();
            if (onDetected) onDetected({ ...currentGame, sessionStart });
        }

        // Game closed
        if (!currentGame && lastDetectedGame) {
            const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
            console.log(`[GG LOOP] Game closed: ${lastDetectedGame.name} (${sessionDuration}s)`);
            if (onClosed) onClosed({ ...lastDetectedGame, sessionDuration });
            lastDetectedGame = null;
            sessionStart = null;
        }

        // Game changed
        if (currentGame && lastDetectedGame && currentGame.id !== lastDetectedGame.id) {
            const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
            console.log(`[GG LOOP] Game changed: ${lastDetectedGame.name} -> ${currentGame.name}`);
            if (onClosed) onClosed({ ...lastDetectedGame, sessionDuration });
            lastDetectedGame = currentGame;
            sessionStart = Date.now();
            if (onDetected) onDetected({ ...currentGame, sessionStart });
        }
    }, interval);

    return () => clearInterval(checkInterval);
}

/**
 * Get list of all supported games
 */
function getSupportedGames() {
    return Object.entries(GAME_PROCESSES).map(([id, game]) => ({
        id,
        name: game.name,
        studio: game.studio,
        icon: game.icon,
        category: game.category,
        steamAppId: game.steamAppId
    }));
}

/**
 * Add a new game to detection (for user requests)
 */
function addGameSupport(gameId, gameData) {
    if (GAME_PROCESSES[gameId]) {
        console.log(`[GG LOOP] Game ${gameId} already exists, updating...`);
    }
    GAME_PROCESSES[gameId] = gameData;
    console.log(`[GG LOOP] Added game: ${gameData.name}`);
}

module.exports = {
    detectGame,
    monitorGames,
    getSupportedGames,
    addGameSupport,
    GAME_PROCESSES
};
