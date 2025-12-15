const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Target game processes
const GAME_PROCESSES = {
    valorant: {
        name: 'Valorant',
        processes: ['VALORANT.exe', 'VALORANT-Win64-Shipping.exe'],
        icon: '🎯'
    },
    league: {
        name: 'League of Legends',
        processes: ['LeagueClientUx.exe', 'LeagueClient.exe', 'League of Legends.exe'],
        icon: '⚔️'
    }
};

/**
 * Detect running game processes on Windows
 * @returns {Promise<Object|null>} Detected game info or null
 */
async function detectGame() {
    try {
        // Use PowerShell to get process list (faster than WMI)
        const { stdout } = await execAsync(
            'powershell -Command "Get-Process | Select-Object -ExpandProperty ProcessName"',
            { timeout: 5000 }
        );

        const runningProcesses = stdout
            .split('\n')
            .map(p => p.trim())
            .filter(Boolean);

        // Check for Valorant
        for (const process of GAME_PROCESSES.valorant.processes) {
            const processName = process.replace('.exe', '');
            if (runningProcesses.includes(processName)) {
                return {
                    id: 'valorant',
                    name: GAME_PROCESSES.valorant.name,
                    process: process,
                    icon: GAME_PROCESSES.valorant.icon,
                    detectedAt: new Date().toISOString()
                };
            }
        }

        // Check for League of Legends
        for (const process of GAME_PROCESSES.league.processes) {
            const processName = process.replace('.exe', '');
            if (runningProcesses.includes(processName)) {
                return {
                    id: 'league',
                    name: GAME_PROCESSES.league.name,
                    process: process,
                    icon: GAME_PROCESSES.league.icon,
                    detectedAt: new Date().toISOString()
                };
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
 * @param {Function} onDetected - Callback when game is detected
 * @param {Function} onClosed - Callback when game is closed
 * @param {number} interval - Poll interval in ms (default 5000)
 */
function monitorGames(onDetected, onClosed, interval = 5000) {
    let lastDetectedGame = null;

    const checkInterval = setInterval(async () => {
        const currentGame = await detectGame();

        // Game launched
        if (currentGame && !lastDetectedGame) {
            console.log(`Game detected: ${currentGame.name}`);
            lastDetectedGame = currentGame;
            if (onDetected) onDetected(currentGame);
        }

        // Game closed
        if (!currentGame && lastDetectedGame) {
            console.log(`Game closed: ${lastDetectedGame.name}`);
            if (onClosed) onClosed(lastDetectedGame);
            lastDetectedGame = null;
        }

        // Game changed (unlikely but possible)
        if (currentGame && lastDetectedGame && currentGame.id !== lastDetectedGame.id) {
            console.log(`Game changed: ${lastDetectedGame.name} -> ${currentGame.name}`);
            if (onClosed) onClosed(lastDetectedGame);
            lastDetectedGame = currentGame;
            if (onDetected) onDetected(currentGame);
        }
    }, interval);

    // Return cleanup function
    return () => clearInterval(checkInterval);
}

module.exports = {
    detectGame,
    monitorGames,
    GAME_PROCESSES
};
