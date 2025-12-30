import axios from 'axios';
// Simple in-memory rate limiter
class RateLimiter {
    constructor(config) {
        this.recentRequests = [];
        this.config = config;
    }
    async waitForSlot() {
        const now = Date.now();
        // Clean up requests older than 2 minutes
        this.recentRequests = this.recentRequests.filter(timestamp => now - timestamp < 120000);
        // Check 2-minute limit
        if (this.recentRequests.length >= this.config.requestsPerTwoMinutes) {
            const oldestRequest = this.recentRequests[0];
            const waitTime = 120000 - (now - oldestRequest) + 100;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.waitForSlot();
        }
        // Check per-second limit
        const recentSecond = this.recentRequests.filter(timestamp => now - timestamp < 1000);
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
};
const VALORANT_REGIONS = {
    na: 'na',
    eu: 'eu',
    br: 'br',
    kr: 'kr',
    latam: 'latam',
    ap: 'ap',
};
// Get routing region from platform region
export function getRoutingRegion(platform) {
    for (const [routing, platforms] of Object.entries(ROUTING_REGIONS)) {
        if (platforms.includes(platform)) {
            return routing;
        }
    }
    return 'americas'; // default
}
// Get routing region from Valorant region
export function getValorantRoutingRegion(valorantRegion) {
    if (!valorantRegion || typeof valorantRegion !== 'string') {
        console.warn(`[Riot] Invalid Valorant region provided: ${valorantRegion}, defaulting to americas`);
        return 'americas';
    }
    const regionMap = {
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
    constructor(apiKey) {
        this.apiKey = apiKey;
        // Development key limits: 20 req/sec, 100 req/2min
        this.rateLimiter = new RateLimiter({
            requestsPerSecond: 18, // Leave buffer for safety
            requestsPerTwoMinutes: 95,
        });
    }
    async makeRequest(url) {
        await this.rateLimiter.waitForSlot();
        try {
            const response = await axios.get(url, {
                headers: {
                    'X-Riot-Token': this.apiKey,
                },
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error;
                // Handle rate limiting
                if (axiosError.response?.status === 429) {
                    const retryAfter = axiosError.response.headers['retry-after'];
                    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
                    console.warn(`[RiotAPI] Rate limited, waiting ${waitTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return this.makeRequest(url);
                }
                // Handle 404 - player not found
                if (axiosError.response?.status === 404) {
                    throw new Error('Player not found');
                }
                // Handle 403 - API key issue (expired or invalid)
                if (axiosError.response?.status === 403) {
                    const errorMessage = `
🚨 RIOT API KEY ERROR 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Riot API key has expired or is invalid.

IMMEDIATE ACTION REQUIRED:
1. Go to: https://developer.riotgames.com/
2. Sign in with your Riot account
3. Get a new Development API Key (or apply for Production)
4. Update Railway environment variable: RIOT_API_KEY

LONG-TERM SOLUTION:
Apply for a Production API Key (never expires)
See: RIOT_API_PRODUCTION_KEY_GUIDE.md in your repo

Affected functionality:
- Account verification
- Match tracking
- Leaderboard updates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim();
                    console.error(errorMessage);
                    throw new Error('Riot API key expired. Admin action required - see server logs for details.');
                }
                // Handle 401 - Unauthorized
                if (axiosError.response?.status === 401) {
                    console.error('🚨 RIOT API: Unauthorized - Check if API key is correctly configured');
                    throw new Error('Riot API authentication failed');
                }
            }
            throw error;
        }
    }
    // Account API - Get PUUID from Riot ID
    async getAccountByRiotId(gameName, tagLine, region = 'americas') {
        const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        return this.makeRequest(url);
    }
    // League of Legends - Get match IDs by PUUID
    // platformRegion: Platform shard like 'na1', 'euw1', etc. Will auto-map to routing region
    async getLeagueMatchIds(puuid, platformRegion = 'na1', options) {
        const routingRegion = getRoutingRegion(platformRegion);
        const params = new URLSearchParams();
        if (options?.start !== undefined)
            params.append('start', options.start.toString());
        if (options?.count !== undefined)
            params.append('count', options.count.toString());
        if (options?.queue !== undefined)
            params.append('queue', options.queue.toString());
        if (options?.type)
            params.append('type', options.type);
        if (options?.startTime !== undefined)
            params.append('startTime', options.startTime.toString());
        if (options?.endTime !== undefined)
            params.append('endTime', options.endTime.toString());
        const queryString = params.toString();
        const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids${queryString ? `?${queryString}` : ''}`;
        return this.makeRequest(url);
    }
    // League of Legends - Get match details
    // platformRegion: Platform shard like 'na1', 'euw1', etc. Will auto-map to routing region
    async getLeagueMatch(matchId, platformRegion = 'na1') {
        const routingRegion = getRoutingRegion(platformRegion);
        const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        return this.makeRequest(url);
    }
    // VALORANT - Get match IDs by PUUID
    async getValorantMatchIds(puuid, region = 'na') {
        const url = `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`;
        const response = await this.makeRequest(url);
        // Normalize to array of match IDs
        return response.history?.map((match) => match.matchId) || [];
    }
    // VALORANT - Get match details
    async getValorantMatch(matchId, region = 'na') {
        const url = `https://${region}.api.riotgames.com/val/match/v1/matches/${matchId}`;
        return this.makeRequest(url);
    }
    // Helper: Check if League match is a win for the player
    isLeagueMatchWin(match, puuid) {
        const participant = match.info.participants.find((p) => p.puuid === puuid);
        return participant?.win || false;
    }
    // Helper: Check if VALORANT match is a win for the player
    isValorantMatchWin(match, puuid) {
        // Find which team the player was on
        const player = match.players.all_players.find((p) => p.puuid === puuid);
        if (!player)
            return false;
        const playerTeam = player.team;
        // Check if that team won
        const teams = match.teams;
        const playerTeamData = teams.find((t) => t.teamId === playerTeam);
        return playerTeamData?.won || false;
    }
    // Teamfight Tactics - Get match IDs by PUUID
    async getTFTMatchIds(puuid, platformRegion = 'na1', options) {
        const routingRegion = getRoutingRegion(platformRegion);
        const count = options?.count || 20;
        const url = `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
        return this.makeRequest(url);
    }
    // Teamfight Tactics - Get match details
    async getTFTMatch(matchId, platformRegion = 'na1') {
        const routingRegion = getRoutingRegion(platformRegion);
        const url = `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/${matchId}`;
        return this.makeRequest(url);
    }
}
// Export singleton instance
let riotAPI = null;
export function getRiotAPI() {
    if (!riotAPI) {
        const apiKey = process.env.RIOT_API_KEY;
        if (!apiKey) {
            throw new Error('RIOT_API_KEY environment variable not set');
        }
        riotAPI = new RiotAPI(apiKey);
    }
    return riotAPI;
}
