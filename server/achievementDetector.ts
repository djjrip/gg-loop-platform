import { db } from './db';
import { achievements, processedRiotMatches, riotAccounts, games } from '@shared/schema';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from './achievementDefinitions';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { IStorage } from './storage';

export class AchievementDetector {
  constructor(private storage: IStorage) {}

  async checkAndAwardAchievements(
    userId: string,
    gameType: 'league' | 'valorant' | 'tft'
  ): Promise<void> {
    const gameAchievements = ACHIEVEMENT_DEFINITIONS.filter(def => def.game === gameType);
    
    for (const achievementDef of gameAchievements) {
      try {
        const hasAchievement = await this.hasUserAchievement(userId, achievementDef.id);
        if (hasAchievement) {
          continue; // Already earned
        }

        const earned = await this.checkAchievementCondition(userId, gameType, achievementDef);
        if (earned) {
          await this.awardAchievement(userId, gameType, achievementDef);
        }
      } catch (error) {
        console.error(`[AchievementDetector] Error checking achievement ${achievementDef.id}:`, error);
      }
    }
  }

  private async hasUserAchievement(userId: string, achievementId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          sql`${achievements.title} = ${this.getAchievementTitle(achievementId)}`
        )
      )
      .limit(1);
    
    return existing.length > 0;
  }

  private getAchievementTitle(achievementId: string): string {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievementId);
    return def?.title || achievementId;
  }

  private async checkAchievementCondition(
    userId: string,
    gameType: 'league' | 'valorant' | 'tft',
    achievementDef: AchievementDefinition
  ): Promise<boolean> {
    const { condition } = achievementDef;

    const account = await db
      .select()
      .from(riotAccounts)
      .where(
        and(
          eq(riotAccounts.userId, userId),
          eq(riotAccounts.game, gameType)
        )
      )
      .limit(1);

    if (!account || account.length === 0) {
      return false;
    }

    const accountId = account[0].id;

    switch (condition.type) {
      case 'win_count':
        return await this.checkWinCount(accountId, condition.threshold!);
      
      case 'win_streak':
        return await this.checkWinStreak(accountId, condition.streak!);
      
      case 'total_matches':
        return await this.checkTotalMatches(accountId, condition.threshold!);
      
      case 'placement':
        return await this.checkTFTPlacement(accountId, condition.placement!);
      
      default:
        return false;
    }
  }

  private async checkWinCount(accountId: string, threshold: number): Promise<boolean> {
    const wins = await db
      .select({ count: sql<number>`count(*)` })
      .from(processedRiotMatches)
      .where(
        and(
          eq(processedRiotMatches.riotAccountId, accountId),
          eq(processedRiotMatches.isWin, true)
        )
      );
    
    return Number(wins[0]?.count || 0) >= threshold;
  }

  private async checkWinStreak(accountId: string, streakRequired: number): Promise<boolean> {
    const recentMatches = await db
      .select()
      .from(processedRiotMatches)
      .where(eq(processedRiotMatches.riotAccountId, accountId))
      .orderBy(desc(processedRiotMatches.gameEndedAt))
      .limit(streakRequired);

    if (recentMatches.length < streakRequired) {
      return false;
    }

    return recentMatches.every((match: any) => match.isWin);
  }

  private async checkTotalMatches(accountId: string, threshold: number): Promise<boolean> {
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(processedRiotMatches)
      .where(eq(processedRiotMatches.riotAccountId, accountId));
    
    return Number(total[0]?.count || 0) >= threshold;
  }

  private async checkTFTPlacement(accountId: string, maxPlacement: number): Promise<boolean> {
    const topPlacements = await db
      .select({ count: sql<number>`count(*)` })
      .from(processedRiotMatches)
      .where(
        and(
          eq(processedRiotMatches.riotAccountId, accountId),
          eq(processedRiotMatches.isWin, true) // For TFT, we consider top 4 as "win" in the match sync
        )
      );
    
    return Number(topPlacements[0]?.count || 0) >= 1;
  }

  private async awardAchievement(
    userId: string,
    gameType: 'league' | 'valorant' | 'tft',
    achievementDef: AchievementDefinition
  ): Promise<void> {
    const game = await db
      .select()
      .from(games)
      .where(
        sql`${games.title} ILIKE ${
          gameType === 'league' ? '%League of Legends%' :
          gameType === 'valorant' ? '%Valorant%' :
          '%TFT%'
        }`
      )
      .limit(1);

    if (!game || game.length === 0) {
      console.error(`[AchievementDetector] Game not found for type: ${gameType}`);
      return;
    }

    const gameId = game[0].id;

    try {
      await this.storage.createAchievement({
        userId,
        gameId,
        title: achievementDef.title,
        description: achievementDef.description,
        pointsAwarded: achievementDef.points,
      });

      console.log(`✨ [Achievement Unlocked] User ${userId} earned "${achievementDef.title}" (+${achievementDef.points} pts)`);
    } catch (error) {
      console.error(`[AchievementDetector] Failed to award achievement ${achievementDef.id}:`, error);
    }
  }
}
