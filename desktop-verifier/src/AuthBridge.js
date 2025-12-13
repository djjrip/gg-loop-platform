const axios = require('axios');
const { machineIdSync } = require('node-machine-id');

class AuthBridge {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.authToken = null;
        this.userId = null;
        this.deviceHash = machineIdSync();
    }

    async authenticateWithWebToken(webToken) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/api/desktop/auth/verify`,
                {
                    webToken,
                    deviceHash: this.deviceHash,
                    timestamp: new Date().toISOString()
                }
            );

            this.authToken = response.data.desktopToken;
            this.userId = response.data.userId;

            console.log(`[AuthBridge] Authenticated user: ${this.userId}`);
            return {
                success: true,
                userId: this.userId,
                token: this.authToken
            };
        } catch (error) {
            console.error('[AuthBridge] Authentication failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async refreshToken() {
        if (!this.authToken) {
            throw new Error('No auth token to refresh');
        }

        try {
            const response = await axios.post(
                `${this.apiUrl}/api/desktop/auth/refresh`,
                {
                    deviceHash: this.deviceHash
                },
                {
                    headers: { Authorization: `Bearer ${this.authToken}` }
                }
            );

            this.authToken = response.data.desktopToken;
            console.log('[AuthBridge] Token refreshed successfully');
            return this.authToken;
        } catch (error) {
            console.error('[AuthBridge] Token refresh failed:', error.message);
            this.authToken = null;
            this.userId = null;
            throw error;
        }
    }

    getAuthHeaders() {
        if (!this.authToken) {
            throw new Error('Not authenticated');
        }

        return {
            Authorization: `Bearer ${this.authToken}`,
            'X-Device-Hash': this.deviceHash
        };
    }

    isAuthenticated() {
        return this.authToken !== null;
    }

    logout() {
        this.authToken = null;
        this.userId = null;
        console.log('[AuthBridge] Logged out');
    }

    getStatus() {
        return {
            authenticated: this.isAuthenticated(),
            userId: this.userId,
            deviceHash: this.deviceHash
        };
    }
}

module.exports = AuthBridge;
