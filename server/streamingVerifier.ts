import { db } from "./db";
import { users, streamingSessions, pointTransactions, games } from "@shared/schema";
import { twitchAPI } from "./lib/twitch";
import { eq, and, sql, isNull } from "drizzle-orm";
import { pointsEngine } from "./pointsEngine";

// Supported games and their Twitch category names
const SUPPORTED_GAMES = {
  'League of Legends': {
    id: '4cf0e30a-7969-4572-a8f5-29ad5935dc00',
    twitchNames: ['League of Legends'],
    pointsPerHour: 5,
  },
  'VALORANT': {
    id: '36f728c6-8143-4be3-9e94-54c549a48d7f',
    twitchNames: ['VALORANT'],
    pointsPerHour: 5,
  },
};

export class StreamingVerifier {
  private isRunning = false;
  private checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  private intervalHandle: NodeJS.Timeout | null = null;

  async startMonitoring() {
    if (this.isRunning) {
      console.log('Streaming verifier already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting streaming verification monitoring...');
    
    // Run immediately, then every interval
    this.checkActiveStreams();
    this.intervalHandle = setInterval(() => this.checkActiveStreams(), this.checkInterval);
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    console.log('Stopped streaming verification monitoring');
  }

  async checkActiveStreams() {
    try {
      console.log('[StreamVerifier] Checking active streams...');

      // Get all users with linked Twitch accounts
      const linkedUsers = await db
        .select({
          id: users.id,
          twitchId: users.twitchId,
          twitchUsername: users.twitchUsername,
          twitchAccessToken: users.twitchAccessToken,
        })
        .from(users)
        .where(sql`${users.twitchId} IS NOT NULL AND ${users.twitchAccessToken} IS NOT NULL`);

      console.log(`[StreamVerifier] Found ${linkedUsers.length} users with linked Twitch accounts`);

      for (const user of linkedUsers) {
        if (!user.twitchUsername || !user.twitchAccessToken) continue;

        try {
          await this.verifyUserStream(user);
        } catch (error) {
          console.error(`[StreamVerifier] Error verifying stream for user ${user.id}:`, error);
        }
      }

      console.log('[StreamVerifier] Finished checking active streams');
    } catch (error) {
      console.error('[StreamVerifier] Error in checkActiveStreams:', error);
    }
  }

  private async verifyUserStream(user: {
    id: string;
    twitchId: string | null;
    twitchUsername: string | null;
    twitchAccessToken: string | null;
  }) {
    if (!user.twitchUsername || !user.twitchAccessToken) return;

    // Check if user is currently streaming
    const streamStatus = await twitchAPI.checkStreamStatus(
      user.twitchUsername,
      user.twitchAccessToken
    );

    if (!streamStatus.isLive) {
      // Close any active sessions
      await this.closeActiveSessions(user.id);
      return;
    }

    // Verify the game being streamed is supported
    const supportedGame = this.getSupportedGame(streamStatus.gameName);
    
    if (!supportedGame) {
      console.log(
        `[StreamVerifier] ${user.twitchUsername} is streaming ${streamStatus.gameName} - not a supported game`
      );
      await this.closeActiveSessions(user.id);
      return;
    }

    console.log(
      `[StreamVerifier] ${user.twitchUsername} is streaming ${streamStatus.gameName} ✓`
    );

    // Check if there's an active session for this stream
    const activeSession = await db
      .select()
      .from(streamingSessions)
      .where(
        and(
          eq(streamingSessions.userId, user.id),
          eq(streamingSessions.status, 'active'),
          eq(streamingSessions.twitchStreamId, streamStatus.streamId!)
        )
      )
      .limit(1);

    if (activeSession.length > 0) {
      // Update existing session
      await this.updateStreamingSession(activeSession[0], streamStatus, supportedGame);
    } else {
      // Close any other active sessions and create new one
      await this.closeActiveSessions(user.id);
      await this.createStreamingSession(user.id, streamStatus, supportedGame);
    }
  }

  private getSupportedGame(gameName?: string) {
    if (!gameName) return null;

    // Case-insensitive matching
    const normalizedGameName = gameName.toLowerCase().trim();

    for (const [gameKey, gameData] of Object.entries(SUPPORTED_GAMES)) {
      const matchFound = gameData.twitchNames.some(
        name => name.toLowerCase() === normalizedGameName
      );
      if (matchFound) {
        return { ...gameData, name: gameKey };
      }
    }
    return null;
  }

  private async createStreamingSession(
    userId: string,
    streamStatus: any,
    supportedGame: any
  ) {
    try {
      await db.insert(streamingSessions).values({
        userId,
        twitchStreamId: streamStatus.streamId,
        gameId: supportedGame.id,
        gameName: supportedGame.name,
        streamStartedAt: new Date(streamStatus.startedAt),
        viewerCount: streamStatus.viewerCount,
        status: 'active',
        lastCheckedAt: new Date(),
      });

      console.log(
        `[StreamVerifier] Created new streaming session for user ${userId} - ${supportedGame.name}`
      );
    } catch (error) {
      console.error('[StreamVerifier] Error creating streaming session:', error);
    }
  }

  private async updateStreamingSession(
    session: any,
    streamStatus: any,
    supportedGame: any
  ) {
    try {
      const now = new Date();
      const startedAt = new Date(session.streamStartedAt);
      const totalMinutesStreamed = Math.floor((now.getTime() - startedAt.getTime()) / 60000);
      
      // Calculate how many full hours have been completed
      const currentPointsAwarded = session.pointsAwarded || 0;
      const hoursAlreadyPaid = currentPointsAwarded / supportedGame.pointsPerHour;
      const totalHoursStreamed = totalMinutesStreamed / 60;
      const hoursToPayFor = totalHoursStreamed - hoursAlreadyPaid;
      
      // Only award points for full hours completed
      const fullHoursToAward = Math.floor(hoursToPayFor);
      const newPoints = fullHoursToAward * supportedGame.pointsPerHour;

      if (newPoints > 0) {
        // Award points to user
        await this.awardStreamingPoints(session.userId, newPoints, supportedGame.name);

        // Update session with new points
        await db
          .update(streamingSessions)
          .set({
            durationMinutes: totalMinutesStreamed,
            viewerCount: streamStatus.viewerCount,
            pointsAwarded: currentPointsAwarded + newPoints,
            lastCheckedAt: now,
          })
          .where(eq(streamingSessions.id, session.id));

        console.log(
          `[StreamVerifier] Updated session for user ${session.userId} - awarded ${newPoints} points (${totalMinutesStreamed} min total, ${fullHoursToAward} new hours)`
        );
      } else {
        // Just update duration, viewer count, and check time (no points yet)
        await db
          .update(streamingSessions)
          .set({
            durationMinutes: totalMinutesStreamed,
            viewerCount: streamStatus.viewerCount,
            lastCheckedAt: now,
          })
          .where(eq(streamingSessions.id, session.id));
      }
    } catch (error) {
      console.error('[StreamVerifier] Error updating streaming session:', error);
    }
  }

  private async closeActiveSessions(userId: string) {
    try {
      const activeSessions = await db
        .select()
        .from(streamingSessions)
        .where(
          and(
            eq(streamingSessions.userId, userId),
            eq(streamingSessions.status, 'active')
          )
        );

      for (const session of activeSessions) {
        const now = new Date();
        const startedAt = new Date(session.streamStartedAt);
        const minutesStreamed = Math.floor((now.getTime() - startedAt.getTime()) / 60000);

        await db
          .update(streamingSessions)
          .set({
            status: 'completed',
            streamEndedAt: now,
            durationMinutes: minutesStreamed,
          })
          .where(eq(streamingSessions.id, session.id));

        console.log(`[StreamVerifier] Closed streaming session ${session.id} for user ${userId}`);
      }
    } catch (error) {
      console.error('[StreamVerifier] Error closing active sessions:', error);
    }
  }

  private async awardStreamingPoints(userId: string, points: number, gameName: string) {
    try {
      // Use pointsEngine to award points with proper validation and monthly caps
      await pointsEngine.awardPoints(
        userId,
        points,
        "STREAMING",
        null,
        "streaming",
        `Streamed ${gameName} on Twitch`
      );

      console.log(`[StreamVerifier] Awarded ${points} points to user ${userId} for streaming ${gameName}`);
    } catch (error) {
      console.error('[StreamVerifier] Error awarding streaming points:', error);
    }
  }

  // Manual trigger for testing/debugging
  async checkUserStream(userId: string) {
    const user = await db
      .select({
        id: users.id,
        twitchId: users.twitchId,
        twitchUsername: users.twitchUsername,
        twitchAccessToken: users.twitchAccessToken,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    await this.verifyUserStream(user[0]);
    return { success: true };
  }
}

export const streamingVerifier = new StreamingVerifier();
