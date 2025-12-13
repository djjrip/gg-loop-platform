const activeWin = require('active-win');
const axios = require('axios');

class SessionTracker {
    constructor(apiUrl, authToken) {
        this.apiUrl = apiUrl;
        this.authToken = authToken;
        this.sessionId = null;
        this.isTracking = false;
        this.trackingInterval = null;
        this.sessionData = {
            windows: [],
            processes: [],
            startTime: null,
            endTime: null
        };
    }

    async startSession() {
        try {
            const response = await axios.post(
                `${this.apiUrl}/api/desktop/session/start`,
                {
                    deviceHash: require('node-machine-id').machineIdSync(),
                    timestamp: new Date().toISOString()
                },
                {
                    headers: { Authorization: `Bearer ${this.authToken}` }
                }
            );

            this.sessionId = response.data.sessionId;
            this.sessionData.startTime = new Date();
            this.isTracking = true;

            // Track active window every 5 seconds
            this.trackingInterval = setInterval(() => this.trackActiveWindow(), 5000);

            console.log(`[SessionTracker] Session started: ${this.sessionId}`);
            return this.sessionId;
        } catch (error) {
            console.error('[SessionTracker] Failed to start session:', error.message);
            throw error;
        }
    }

    async trackActiveWindow() {
        if (!this.isTracking) return;

        try {
            const window = await activeWin();
            if (window) {
                const entry = {
                    title: window.title,
                    owner: window.owner.name,
                    timestamp: new Date().toISOString()
                };

                this.sessionData.windows.push(entry);

                // Track League of Legends, VALORANT, TFT processes
                if (this.isGameProcess(window.owner.name)) {
                    this.sessionData.processes.push(entry);
                    console.log(`[SessionTracker] Game detected: ${window.owner.name}`);
                }
            }
        } catch (error) {
            console.error('[SessionTracker] Error tracking window:', error.message);
        }
    }

    isGameProcess(processName) {
        const gameProcesses = [
            'League of Legends',
            'VALORANT',
            'Teamfight Tactics',
            'LeagueClient',
            'RiotClientServices'
        ];
        return gameProcesses.some(game => processName.includes(game));
    }

    async endSession() {
        if (!this.isTracking) return;

        this.isTracking = false;
        clearInterval(this.trackingInterval);
        this.sessionData.endTime = new Date();

        const duration = (this.sessionData.endTime - this.sessionData.startTime) / 1000; // seconds

        try {
            await axios.post(
                `${this.apiUrl}/api/desktop/session/end`,
                {
                    sessionId: this.sessionId,
                    duration,
                    windowCount: this.sessionData.windows.length,
                    gameProcessCount: this.sessionData.processes.length,
                    timestamp: new Date().toISOString()
                },
                {
                    headers: { Authorization: `Bearer ${this.authToken}` }
                }
            );

            console.log(`[SessionTracker] Session ended: ${this.sessionId} (${duration}s)`);
            return this.sessionData;
        } catch (error) {
            console.error('[SessionTracker] Failed to end session:', error.message);
            throw error;
        }
    }

    getSessionData() {
        return {
            sessionId: this.sessionId,
            ...this.sessionData,
            duration: this.sessionData.endTime
                ? (this.sessionData.endTime - this.sessionData.startTime) / 1000
                : null
        };
    }
}

module.exports = SessionTracker;
