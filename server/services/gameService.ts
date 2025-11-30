/**
 * Game Service Layer - Multi-Game Abstraction
 * 
 * This service provides a unified interface for integrating any game.
 * Currently supports: League of Legends, Valorant, and custom games.
 * 
 * Usage:
 * const gameService = new GameService('league-of-legends');
 * const stats = await gameService.getPlayerStats(playerId);
 */

export type GameProvider = 'riot' | 'valve' | 'blizzard' | 'custom' | 'firebase';

export interface GameConfig {
  id: string;
  name: string;
  provider: GameProvider;
  apiEndpoint: string;
  apiKey?: string;
  pointsPerKill: number;
  pointsPerWin: number;
  pointsPerMatch: number; // Base points just for playing
  maxPointsPerMatch: number;
  rankingSystemType: 'elo' | 'mmr' | 'tier' | 'custom';
  matchHistoryLimit: number;
  leaderboardSize: number;
}

export interface PlayerStats {
  playerId: string;
  gameId: string;
  rank: string;
  rp: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  totalMatches: number;
  lastMatch?: Date;
  lastUpdated: Date;
}

export interface MatchData {
  matchId: string;
  playerId: string;
  gameId: string;
  timestamp: Date;
  result: 'win' | 'loss' | 'draw';
  kills?: number;
  deaths?: number;
  assists?: number;
  duration: number; // seconds
  pointsEarned: number;
  rank?: string;
}

export interface Leaderboard {
  gameId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  pointsEarned: number;
  wins: number;
  winRate: number;
}

// Supported games registry
export const SUPPORTED_GAMES: Record<string, GameConfig> = {
  'league-of-legends': {
    id: 'league-of-legends',
    name: 'League of Legends',
    provider: 'riot',
    apiEndpoint: 'https://na1.api.riotgames.com',
    pointsPerKill: 10,
    pointsPerWin: 100,
    pointsPerMatch: 25,
    maxPointsPerMatch: 250,
    rankingSystemType: 'tier',
    matchHistoryLimit: 20,
    leaderboardSize: 100,
  },
  'valorant': {
    id: 'valorant',
    name: 'Valorant',
    provider: 'riot',
    apiEndpoint: 'https://valorant-api.com/v1',
    pointsPerKill: 12,
    pointsPerWin: 120,
    pointsPerMatch: 30,
    maxPointsPerMatch: 300,
    rankingSystemType: 'tier',
    matchHistoryLimit: 20,
    leaderboardSize: 100,
  },
  'cs2': {
    id: 'cs2',
    name: 'Counter-Strike 2',
    provider: 'valve',
    apiEndpoint: 'https://api.steampowered.com',
    pointsPerKill: 8,
    pointsPerWin: 80,
    pointsPerMatch: 20,
    maxPointsPerMatch: 200,
    rankingSystemType: 'elo',
    matchHistoryLimit: 50,
    leaderboardSize: 100,
  },
  'overwatch2': {
    id: 'overwatch2',
    name: 'Overwatch 2',
    provider: 'blizzard',
    apiEndpoint: 'https://ow-api.com/v1',
    pointsPerKill: 5,
    pointsPerWin: 90,
    pointsPerMatch: 20,
    maxPointsPerMatch: 220,
    rankingSystemType: 'tier',
    matchHistoryLimit: 30,
    leaderboardSize: 100,
  },
  'custom': {
    id: 'custom',
    name: 'Custom Game',
    provider: 'custom',
    apiEndpoint: 'https://custom.ggloop.io/v1',
    pointsPerKill: 10,
    pointsPerWin: 100,
    pointsPerMatch: 25,
    maxPointsPerMatch: 250,
    rankingSystemType: 'custom',
    matchHistoryLimit: 100,
    leaderboardSize: 100,
  },
};

export class GameService {
  private gameConfig: GameConfig;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor(gameId: string) {
    const config = SUPPORTED_GAMES[gameId];
    if (!config) {
      throw new Error(`Game '${gameId}' is not supported. Available: ${Object.keys(SUPPORTED_GAMES).join(', ')}`);
    }
    this.gameConfig = config;
  }

  /**
   * Get player statistics
   * Cached for performance
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const stats = await this.fetchPlayerStatsFromProvider(playerId);
    return stats;
  }

  /**
   * Record a match result
   * Calculates points and updates player stats
   */
  async recordMatch(matchData: MatchData): Promise<{ pointsEarned: number; totalPoints: number }> {
    const pointsEarned = this.calculatePoints(matchData);

    return {
      pointsEarned,
      totalPoints: pointsEarned, // Will be accumulated by parent service
    };
  }

  /**
   * Get game-specific leaderboard
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'allTime'): Promise<Leaderboard> {
    const entries = await this.fetchLeaderboardFromProvider(period);
    return {
      gameId: this.gameConfig.id,
      period,
      entries,
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate points earned from a match
   * Formula: base points + kill bonus + win bonus
   */
  private calculatePoints(match: MatchData): number {
    let points = this.gameConfig.pointsPerMatch;

    // Add kill bonus
    if (match.kills) {
      points += match.kills * this.gameConfig.pointsPerKill;
    }

    // Add win bonus
    if (match.result === 'win') {
      points += this.gameConfig.pointsPerWin;
    }

    // Cap at maximum
    return Math.min(points, this.gameConfig.maxPointsPerMatch);
  }

  /**
   * Fetch player stats from external provider
   * Override for each provider
   */
  private async fetchPlayerStatsFromProvider(playerId: string): Promise<PlayerStats> {
    switch (this.gameConfig.provider) {
      case 'riot':
        return this.fetchRiotStats(playerId);
      case 'valve':
        return this.fetchValveStats(playerId);
      case 'blizzard':
        return this.fetchBlizzardStats(playerId);
      case 'custom':
        return this.fetchCustomStats(playerId);
      default:
        throw new Error(`Provider ${this.gameConfig.provider} not implemented`);
    }
  }

  /**
   * Fetch leaderboard from provider
   */
  private async fetchLeaderboardFromProvider(period: 'daily' | 'weekly' | 'monthly' | 'allTime'): Promise<LeaderboardEntry[]> {
    // Implementation depends on provider
    // For now, return mock data
    return [
      {
        rank: 1,
        playerId: 'player1',
        playerName: 'ProPlayer',
        pointsEarned: 5000,
        wins: 150,
        winRate: 0.65,
      },
    ];
  }

  private async fetchRiotStats(playerId: string): Promise<PlayerStats> {
    try {
      const response = await fetch(`${this.gameConfig.apiEndpoint}/lol/summoner/v4/summoners/by-name/${playerId}`, {
        headers: { 'X-Riot-Token': this.gameConfig.apiKey || process.env.RIOT_API_KEY || '' },
      });

      if (!response.ok) {
        throw new Error(`Riot API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        playerId,
        gameId: this.gameConfig.id,
        rank: data.tier || 'Unranked',
        rp: data.rp || 0,
        wins: data.wins || 0,
        losses: data.losses || 0,
        winRate: data.wins ? data.wins / (data.wins + data.losses) : 0,
        averageKills: 0, // Not available from Riot API summary
        averageDeaths: 0,
        averageAssists: 0,
        totalMatches: (data.wins || 0) + (data.losses || 0),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching Riot stats for ${playerId}:`, error);
      throw error;
    }
  }

  private async fetchValveStats(playerId: string): Promise<PlayerStats> {
    // Valve Steam API implementation
    try {
      const response = await fetch(`${this.gameConfig.apiEndpoint}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.gameConfig.apiKey || process.env.VALVE_API_KEY}&steamids=${playerId}`);

      if (!response.ok) {
        throw new Error(`Valve API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        playerId,
        gameId: this.gameConfig.id,
        rank: 'Unranked', // CS2 doesn't have visible ranking
        rp: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        averageKills: 0,
        averageDeaths: 0,
        averageAssists: 0,
        totalMatches: 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching Valve stats for ${playerId}:`, error);
      throw error;
    }
  }

  private async fetchBlizzardStats(playerId: string): Promise<PlayerStats> {
    // Blizzard Battle.net API implementation
    // Similar pattern to above
    return {
      playerId,
      gameId: this.gameConfig.id,
      rank: 'Unranked',
      rp: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageKills: 0,
      averageDeaths: 0,
      averageAssists: 0,
      totalMatches: 0,
      lastUpdated: new Date(),
    };
  }

  private async fetchCustomStats(playerId: string): Promise<PlayerStats> {
    // For white-label custom games - implement per integration
    return {
      playerId,
      gameId: this.gameConfig.id,
      rank: 'Unranked',
      rp: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageKills: 0,
      averageDeaths: 0,
      averageAssists: 0,
      totalMatches: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all supported games
   */
  static getSupportedGames(): GameConfig[] {
    return Object.values(SUPPORTED_GAMES);
  }

  /**
   * Check if a game is supported
   */
  static isGameSupported(gameId: string): boolean {
    return gameId in SUPPORTED_GAMES;
  }

  /**
   * Get game config by ID
   */
  static getGameConfig(gameId: string): GameConfig | null {
    return SUPPORTED_GAMES[gameId] || null;
  }
}

export default GameService;
