import axios, { AxiosError } from 'axios';

/**
 * Riot API Client Wrapper
 * 
 * IMPORTANT: This implementation uses in-memory rate limiting which only works
 * for single-instance deployments. If you scale to multiple servers, you MUST
 * replace this with a Redis-backed solution (e.g., @fightmegg/riot-rate-limiter)
 * to properly enforce rate limits across all instances.
 * 
 * For MVP/development with single instance: This implementation is sufficient.
 * For production with horizontal scaling: Upgrade to distributed rate limiting.
 */

// Rate limiting configuration
interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerTwoMinutes: number;
}

// Simple in-memory rate limiter
class RateLimiter {
  private recentRequests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Clean up requests older than 2 minutes
    this.recentRequests = this.recentRequests.filter(
      timestamp => now - timestamp < 120000
    );

    // Check 2-minute limit
    if (this.recentRequests.length >= this.config.requestsPerTwoMinutes) {
      const oldestRequest = this.recentRequests[0];
      const waitTime = 120000 - (now - oldestRequest) + 100;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot();
    }

    // Check per-second limit
    const recentSecond = this.recentRequests.filter(
      timestamp => now - timestamp < 1000
    );
    if (recentSecond.length >= this.config.requestsPerSecond) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.waitForSlot();
    }

    // Record this request
    this.recentRequests.push(now);
  }
}

// Regional routing for different APIs
const ROUTING_REGIONS = {
  americas: ['na1', 'br1', 'la1', 'la2'],
  asia: ['kr', 'jp1'],
  europe: ['euw1', 'eun1', 'tr1', 'ru'],
  sea: ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'],
} as const;

const VALORANT_REGIONS = {
  na: 'na',
  eu: 'eu',
  br: 'br',
  kr: 'kr',
  latam: 'latam',
  ap: 'ap',
} as const;

// Get routing region from platform region
export function getRoutingRegion(platform: string): string {
  for (const [routing, platforms] of Object.entries(ROUTING_REGIONS)) {
    if ((platforms as readonly string[]).includes(platform)) {
      return routing;
    }
  }
  return 'americas'; // default
}

// Get routing region from Valorant region
export function getValorantRoutingRegion(valorantRegion: string): string {
  if (!valorantRegion || typeof valorantRegion !== 'string') {
    console.warn(`[Riot] Invalid Valorant region provided: ${valorantRegion}, defaulting to americas`);
    return 'americas';
  }

  const regionMap: Record<string, string> = {
    na: 'americas',
    br: 'americas',
    latam: 'americas',
    pbe: 'americas', // Public Beta Environment
    eu: 'europe',
    kr: 'asia',
    ap: 'asia',
  };

  const normalized = valorantRegion.toLowerCase().trim();
  const routing = regionMap[normalized];

  if (!routing) {
    console.warn(`[Riot] Unknown Valorant region: ${valorantRegion}, defaulting to americas`);
    return 'americas';
  }

  return routing;
}

export class RiotAPI {
  private apiKey: string;
  private rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Development key limits: 20 req/sec, 100 req/2min
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 18, // Leave buffer for safety
      requestsPerTwoMinutes: 95,
    });
  }

  private async makeRequest<T>(url: string): Promise<T> {
    await this.rateLimiter.waitForSlot();

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Riot-Token': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Handle rate limiting
        if (axiosError.response?.status === 429) {
          const retryAfter = axiosError.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
          console.warn(`[RiotAPI] Rate limited, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.makeRequest<T>(url);
        }

        // Handle 404 - player not found
        if (axiosError.response?.status === 404) {
          throw new Error('Player not found');
        }

        // Handle 403 - API key issue
        if (axiosError.response?.status === 403) {
          console.error('🚨 RIOT API KEY ERROR: The key is invalid or expired. Please renew it at https://developer.riotgames.com/');
          throw new Error('Invalid API key or unauthorized access');
        }
      }
      throw error;
    }
  }

  // Account API - Get PUUID from Riot ID
  async getAccountByRiotId(gameName: string, tagLine: string, region: string = 'americas'): Promise<{
    puuid: string;
    gameName: string;
    tagLine: string;
  }> {
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return this.makeRequest(url);
  }

  // League of Legends - Get match IDs by PUUID
  // platformRegion: Platform shard like 'na1', 'euw1', etc. Will auto-map to routing region
  async getLeagueMatchIds(
    puuid: string,
    platformRegion: string = 'na1',
    options?: {
      start?: number;
      count?: number;
      queue?: number; // 420 = Ranked Solo, 440 = Ranked Flex, etc.
      type?: 'ranked' | 'normal' | 'tourney';
      startTime?: number; // Unix timestamp (seconds)
      endTime?: number;
    }
  ): Promise<string[]> {
    const routingRegion = getRoutingRegion(platformRegion);
    const params = new URLSearchParams();
    if (options?.start !== undefined) params.append('start', options.start.toString());
    if (options?.count !== undefined) params.append('count', options.count.toString());
    if (options?.queue !== undefined) params.append('queue', options.queue.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.startTime !== undefined) params.append('startTime', options.startTime.toString());
    if (options?.endTime !== undefined) params.append('endTime', options.endTime.toString());

    const queryString = params.toString();
    const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(url);
  }

  // League of Legends - Get match details
  // platformRegion: Platform shard like 'na1', 'euw1', etc. Will auto-map to routing region
  async getLeagueMatch(matchId: string, platformRegion: string = 'na1'): Promise<any> {
    const routingRegion = getRoutingRegion(platformRegion);
    const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    return this.makeRequest(url);
  }

  // VALORANT - Get match IDs by PUUID
  async getValorantMatchIds(
    puuid: string,
    region: keyof typeof VALORANT_REGIONS = 'na'
  ): Promise<string[]> {
    const url = `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`;
    const response = await this.makeRequest<{ history: Array<{ matchId: string }> }>(url);
    // Normalize to array of match IDs
    return response.history?.map((match) => match.matchId) || [];
  }

  // VALORANT - Get match details
  async getValorantMatch(matchId: string, region: keyof typeof VALORANT_REGIONS = 'na'): Promise<any> {
    const url = `https://${region}.api.riotgames.com/val/match/v1/matches/${matchId}`;
    return this.makeRequest(url);
  }

  // Helper: Check if League match is a win for the player
  isLeagueMatchWin(match: any, puuid: string): boolean {
    const participant = match.info.participants.find((p: any) => p.puuid === puuid);
    return participant?.win || false;
  }

  // Helper: Check if VALORANT match is a win for the player
  isValorantMatchWin(match: any, puuid: string): boolean {
    // Find which team the player was on
    const player = match.players.all_players.find((p: any) => p.puuid === puuid);
    if (!player) return false;

    const playerTeam = player.team;

    // Check if that team won
    const teams = match.teams;
    const playerTeamData = teams.find((t: any) => t.teamId === playerTeam);
    return playerTeamData?.won || false;
  }

  // Teamfight Tactics - Get match IDs by PUUID
  async getTFTMatchIds(
    puuid: string,
    platformRegion: string = 'na1',
    options?: { count?: number }
  ): Promise<string[]> {
    const routingRegion = getRoutingRegion(platformRegion);
    const count = options?.count || 20;
    const url = `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
    return this.makeRequest(url);
  }

  // Teamfight Tactics - Get match details
  async getTFTMatch(matchId: string, platformRegion: string = 'na1'): Promise<any> {
    const routingRegion = getRoutingRegion(platformRegion);
    const url = `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/${matchId}`;
    return this.makeRequest(url);
  }
}

// Export singleton instance
let riotAPI: RiotAPI | null = null;

export function getRiotAPI(): RiotAPI {
  if (!riotAPI) {
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error('RIOT_API_KEY environment variable not set');
    }
    riotAPI = new RiotAPI(apiKey);
  }
  return riotAPI;
}
