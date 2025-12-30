import axios from 'axios';
import { encrypt, decrypt } from './encryption';
const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_BASE = 'https://id.twitch.tv/oauth2';
export class TwitchAPI {
    constructor() {
        this.clientId = process.env.TWITCH_CLIENT_ID || '';
        this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
        if (!this.clientId || !this.clientSecret) {
            console.warn('Twitch API credentials not configured');
        }
    }
    getAuthorizationUrl(redirectUri, state) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'user:read:email',
            state,
        });
        return `${TWITCH_AUTH_BASE}/authorize?${params.toString()}`;
    }
    async exchangeCodeForTokens(code, redirectUri) {
        const response = await axios.post(`${TWITCH_AUTH_BASE}/token`, null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            },
        });
        return response.data;
    }
    async refreshAccessToken(refreshToken) {
        const decryptedToken = decrypt(refreshToken);
        const response = await axios.post(`${TWITCH_AUTH_BASE}/token`, null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: decryptedToken,
                grant_type: 'refresh_token',
            },
        });
        return response.data;
    }
    async getUserInfo(accessToken) {
        const decryptedToken = decrypt(accessToken);
        const response = await axios.get(`${TWITCH_API_BASE}/users`, {
            headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${decryptedToken}`,
            },
        });
        return response.data.data[0];
    }
    async getStream(userId, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${TWITCH_API_BASE}/streams`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${decryptedToken}`,
                },
                params: {
                    user_id: userId,
                },
            });
            return response.data.data[0] || null;
        }
        catch (error) {
            console.error('Error fetching Twitch stream:', error);
            return null;
        }
    }
    async checkStreamStatus(twitchUsername, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            const response = await axios.get(`${TWITCH_API_BASE}/streams`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${decryptedToken}`,
                },
                params: {
                    user_login: twitchUsername,
                },
            });
            const stream = response.data.data[0];
            if (!stream || stream.type !== 'live') {
                return { isLive: false };
            }
            return {
                isLive: true,
                gameName: stream.game_name,
                viewerCount: stream.viewer_count,
                startedAt: stream.started_at,
                streamId: stream.id,
            };
        }
        catch (error) {
            console.error('Error checking stream status:', error);
            return { isLive: false };
        }
    }
    encryptToken(token) {
        return encrypt(token);
    }
    decryptToken(encryptedToken) {
        return decrypt(encryptedToken);
    }
}
export const twitchAPI = new TwitchAPI();
