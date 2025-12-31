import { db } from './database';
import { achievements, processedRiotMatches, riotAccounts, games } from "../shared/schema";
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from './achievementDefinitions';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { IStorage } from './storage';

export class AchievementDetector {
  constructor(private storage: IStorage) { }

  async checkAndAwardAchievements(
    userId: string,
    gameType: 'league' | 'valorant' | 'tft' | 'coding'
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
    gameType: 'league' | 'valorant' | 'tft' | 'coding',
    achievementDef: AchievementDefinition
  ): Promise<boolean> {
    const { condition } = achievementDef;

    if (gameType === 'coding') {
      switch (condition.type) {
        case 'total_sessions':
          return await this.checkCodingSessions(userId, condition.sessions!);
        case 'total_hours':
          return await this.checkCodingHours(userId, condition.hours!);
        default:
          return false;
      }
    }

    const account = await db
      .select()
      .from(riotAccounts)
      .where(
        and(
          eq(riotAccounts.userId, userId),
          eq(riotAccounts.game, gameType as any)
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

  // ===== CODING CHECKS =====
  private async checkCodingSessions(userId: string, sessionsRequired: number): Promise<boolean> {
    // Count transactions from desktop sessions
    // Using simple query similar to points engine usage
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(db.select().from(pointTransactions).as('pt')) // subquery wrapper if needed, or direct
      .where(
        and(
          eq(sql`pt.user_id`, userId),
          eq(sql`pt.source_type`, 'desktop_session'),
          eq(sql`pt.type`, 'gameplay_verified')
        )
      );

    // Note: Drizzle raw SQL might be safer here depending on import aliasing
    const sessions = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM point_transactions 
      WHERE user_id = ${userId} 
      AND source_type = 'desktop_session' 
      AND type = 'gameplay_verified'
    `);

    return Number(sessions[0]?.count || 0) >= sessionsRequired;
  }

  private async checkCodingHours(userId: string, hoursRequired: number): Promise<boolean> {
    // Sum points and divide by base rate (assuming ~60-100 pts per hour base) 
    // OR better: parse description or store duration. 
    // For now, let's use a rough estimate: 1 session ~= 1 hour or check description
    // Innovation: Check 'description' for minutes if stored like "Verified gameplay: 60min..."

    // Safer approach: Sum 'amount' and divide by average points/hour (approx 60 for free/basic)
    // Threshold = hours * 60 points.

    const result = await db.execute(sql`
      SELECT SUM(amount) as total_points 
      FROM point_transactions 
      WHERE user_id = ${userId} 
      AND source_type = 'desktop_session'
      AND type = 'gameplay_verified'
    `);

    // Conservative estimate: 100 points = 1 hour (including multipliers)
    const points = Number(result[0]?.total_points || 0);
    return points >= (hoursRequired * 60);
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
    gameType: 'league' | 'valorant' | 'tft' | 'coding',
    achievementDef: AchievementDefinition
  ): Promise<void> {
    let gameId: string;

    if (gameType === 'coding') {
      // Find or Use a generic "GG LOOP" or "Coding" game entry
      // For now, let's look for "Vibe Coding" or fallback to creating it?
      // Better: Use a known ID or find by name
      const game = await db.execute(sql`SELECT id FROM games WHERE title = 'Vibe Coding' LIMIT 1`);
      if (game[0]?.id) {
        gameId = game[0].id as string;
      } else {
        // Fallback: check for "GG LOOP"
        const fallback = await db.execute(sql`SELECT id FROM games WHERE title = 'GG LOOP' LIMIT 1`);
        if (fallback[0]?.id) {
          gameId = fallback[0].id as string;
        } else {
          console.error('[AchievementDetector] No "Vibe Coding" or "GG LOOP" game found to link achievement.');
          return;
        }
      }
    } else {
      const game = await db
        .select()
        .from(games)
        .where(
          sql`${games.title} ILIKE ${gameType === 'league' ? '%League of Legends%' :
              gameType === 'valorant' ? '%Valorant%' :
                '%TFT%'
            }`
        )
        .limit(1);

      if (!game || game.length === 0) {
        console.error(`[AchievementDetector] Game not found for type: ${gameType}`);
        return;
      }
      gameId = game[0].id;
    }

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

