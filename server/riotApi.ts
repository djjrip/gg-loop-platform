const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Regional routing values
const REGIONAL_ENDPOINTS: Record<string, string> = {
  // Broad regions (used by guest signup form)
  'americas': 'americas',
  'europe': 'europe',
  'asia': 'asia',
  // Specific server regions (backward compatibility)
  'na': 'americas',
  'euw': 'europe',
  'eune': 'europe',
  'kr': 'asia',
  'br': 'americas',
  'lan': 'americas',
  'las': 'americas',
  'oce': 'americas',
  'ru': 'europe',
  'tr': 'europe',
  'jp': 'asia',
};

// Platform endpoints for summoner data
const PLATFORM_ENDPOINTS: Record<string, string> = {
  'na': 'na1',
  'euw': 'euw1',
  'eune': 'eun1',
  'kr': 'kr',
  'br': 'br1',
  'lan': 'la1',
  'las': 'la2',
  'oce': 'oc1',
  'ru': 'ru',
  'tr': 'tr1',
  'jp': 'jp1',
};

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface MatchDetails {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameMode: string;
    queueId: number;
    gameDuration: number;
    gameEndTimestamp: number;
    participants: Array<{
      puuid: string;
      summonerName: string;
      championName: string;
      kills: number;
      deaths: number;
      assists: number;
      win: boolean;
    }>;
  };
}

export class RiotApiService {
  private apiKey: string;

  constructor() {
    if (!RIOT_API_KEY) {
      throw new Error("RIOT_API_KEY not configured");
    }
    this.apiKey = RIOT_API_KEY;
  }

  /**
   * Verify a Riot account by Riot ID (gameName#tagLine)
   * Returns account data with PUUID
   */
  async verifyAccount(gameName: string, tagLine: string, region: string = 'na'): Promise<RiotAccount> {
    const regionalEndpoint = REGIONAL_ENDPOINTS[region] || 'americas';
    const url = `https://${regionalEndpoint}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });

    if (response.status === 404) {
      throw new Error('Riot account not found. Check your Riot ID format (GameName#Tag)');
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Riot API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      puuid: data.puuid,
      gameName: data.gameName || gameName,
      tagLine: data.tagLine || tagLine,
    };
  }

  /**
   * Get recent match IDs for a player
   */
  async getRecentMatchIds(puuid: string, region: string = 'na', count: number = 20): Promise<string[]> {
    const regionalEndpoint = REGIONAL_ENDPOINTS[region] || 'americas';
    const url = `https://${regionalEndpoint}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get detailed match data
   */
  async getMatchDetails(matchId: string, region: string = 'na'): Promise<MatchDetails> {
    const regionalEndpoint = REGIONAL_ENDPOINTS[region] || 'americas';
    const url = `https://${regionalEndpoint}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch match details: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Verify a match win for a specific player
   * Returns true if the player won the match
   */
  async verifyMatchWin(matchId: string, puuid: string, region: string = 'na'): Promise<{
    won: boolean;
    matchData: any;
  }> {
    const match = await this.getMatchDetails(matchId, region);
    
    const participant = match.info.participants.find(p => p.puuid === puuid);
    
    if (!participant) {
      throw new Error('Player not found in match');
    }

    return {
      won: participant.win,
      matchData: {
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        gameDuration: match.info.gameDuration,
        gameEndTimestamp: match.info.gameEndTimestamp,
      },
    };
  }

  /**
   * Check for recent wins (matches played in the last 24 hours)
   * Returns array of winning matches
   */
  async getRecentWins(puuid: string, region: string = 'na', hoursSince: number = 24): Promise<any[]> {
    const matchIds = await this.getRecentMatchIds(puuid, region, 20);
    const cutoffTime = Date.now() - (hoursSince * 60 * 60 * 1000);
    const wins = [];

    for (const matchId of matchIds) {
      try {
        const match = await this.getMatchDetails(matchId, region);
        
        // Check if match is recent enough
        if (match.info.gameEndTimestamp < cutoffTime) {
          break; // Matches are ordered newest first
        }

        const participant = match.info.participants.find(p => p.puuid === puuid);
        
        if (participant && participant.win) {
          wins.push({
            matchId,
            championName: participant.championName,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            gameDuration: match.info.gameDuration,
            gameEndTimestamp: match.info.gameEndTimestamp,
          });
        }
      } catch (error) {
        console.error(`Error fetching match ${matchId}:`, error);
        continue;
      }
    }

    return wins;
  }

  /**
   * Verify third-party code for account ownership proof
   * Uses Riot's third-party code API to confirm the user entered the code in their game client
   * https://developer.riotgames.com/apis#league-of-legends-v4/GET_getThirdPartyCode
   */
  async verifyThirdPartyCode(puuid: string, expectedCode: string, region: string = 'na'): Promise<boolean> {
    const platformEndpoint = PLATFORM_ENDPOINTS[region] || 'na1';
    const url = `https://${platformEndpoint}.api.riotgames.com/lol/platform/v4/third-party-code/by-puuid/${puuid}`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey,
        },
      });

      if (response.status === 404) {
        // Code not set in client yet
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to verify code: ${response.status}`);
      }

      const actualCode = await response.text();
      // Response is just the plain text code
      return actualCode.trim().toUpperCase() === expectedCode.trim().toUpperCase();
    } catch (error) {
      console.error('Error verifying third-party code:', error);
      return false;
    }
  }

  /**
   * Get recent TFT match IDs for a player
   */
  async getTFTMatchIds(puuid: string, region: string = 'na', options: { count?: number } = {}): Promise<string[]> {
    const { count = 20 } = options;
    const regionalEndpoint = REGIONAL_ENDPOINTS[region] || 'americas';
    const url = `https://${regionalEndpoint}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TFT matches: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get detailed TFT match data
   */
  async getTFTMatch(matchId: string, region: string = 'na'): Promise<any> {
    const regionalEndpoint = REGIONAL_ENDPOINTS[region] || 'americas';
    const url = `https://${regionalEndpoint}.api.riotgames.com/tft/match/v1/matches/${matchId}`;

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TFT match details: ${response.status}`);
    }

    return await response.json();
  }
}
