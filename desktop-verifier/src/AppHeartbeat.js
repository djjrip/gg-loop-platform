const axios = require('axios');

class AppHeartbeat {
    constructor(apiUrl, authToken, interval = 30000) {
        this.apiUrl = apiUrl;
        this.authToken = authToken;
        this.interval = interval; // Default: 30 seconds
        this.heartbeatTimer = null;
        this.isRunning = false;
        this.missedBeats = 0;
    }

    start(sessionId) {
        if (this.isRunning) {
            console.log('[AppHeartbeat] Already running');
            return;
        }

        this.sessionId = sessionId;
        this.isRunning = true;
        this.missedBeats = 0;

        console.log(`[AppHeartbeat] Starting heartbeat (${this.interval}ms interval)`);

        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.interval);
    }

    async sendHeartbeat() {
        if (!this.isRunning) return;

        try {
            const response = await axios.post(
                `${this.apiUrl}/api/desktop/heartbeat`,
                {
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString(),
                    status: 'active'
                },
                {
                    headers: { Authorization: `Bearer ${this.authToken}` },
                    timeout: 5000
                }
            );

            this.missedBeats = 0;
            console.log('[AppHeartbeat] Heartbeat sent successfully');
            return response.data;
        } catch (error) {
            this.missedBeats++;
            console.error(`[AppHeartbeat] Failed to send heartbeat (${this.missedBeats} missed):`, error.message);

            if (this.missedBeats >= 3) {
                console.error('[AppHeartbeat] Too many missed beats, stopping heartbeat');
                this.stop();
            }
        }
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        console.log('[AppHeartbeat] Heartbeat stopped');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            sessionId: this.sessionId,
            missedBeats: this.missedBeats,
            interval: this.interval
        };
    }
}

module.exports = AppHeartbeat;
