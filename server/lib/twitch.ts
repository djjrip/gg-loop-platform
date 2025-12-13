import axios from 'axios';
import { encrypt, decrypt } from './encryption';

const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_BASE = 'https://id.twitch.tv/oauth2';

export interface TwitchTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  email?: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

export class TwitchAPI {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Twitch API credentials not configured');
    }
  }

  getAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user:read:email',
      state,
    });
    return `${TWITCH_AUTH_BASE}/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<TwitchTokens> {
    const response = await axios.post<TwitchTokens>(`${TWITCH_AUTH_BASE}/token`, null, {
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

  async refreshAccessToken(refreshToken: string): Promise<TwitchTokens> {
    const decryptedToken = decrypt(refreshToken);
    const response = await axios.post<TwitchTokens>(`${TWITCH_AUTH_BASE}/token`, null, {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: decryptedToken,
        grant_type: 'refresh_token',
      },
    });
    return response.data;
  }

  async getUserInfo(accessToken: string): Promise<TwitchUser> {
    const decryptedToken = decrypt(accessToken);
    const response = await axios.get<{ data: TwitchUser[] }>(`${TWITCH_API_BASE}/users`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${decryptedToken}`,
      },
    });
    return response.data.data[0];
  }

  async getStream(userId: string, accessToken: string): Promise<TwitchStream | null> {
    try {
      const decryptedToken = decrypt(accessToken);
      const response = await axios.get<{ data: TwitchStream[] }>(`${TWITCH_API_BASE}/streams`, {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${decryptedToken}`,
        },
        params: {
          user_id: userId,
        },
      });
      
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Error fetching Twitch stream:', error);
      return null;
    }
  }

  async checkStreamStatus(twitchUsername: string, accessToken: string): Promise<{
    isLive: boolean;
    gameName?: string;
    viewerCount?: number;
    startedAt?: string;
    streamId?: string;
  }> {
    try {
      const decryptedToken = decrypt(accessToken);
      const response = await axios.get<{ data: TwitchStream[] }>(`${TWITCH_API_BASE}/streams`, {
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
    } catch (error) {
      console.error('Error checking stream status:', error);
      return { isLive: false };
    }
  }

  encryptToken(token: string): string {
    return encrypt(token);
  }

  decryptToken(encryptedToken: string): string {
    return decrypt(encryptedToken);
  }
}

export const twitchAPI = new TwitchAPI();
