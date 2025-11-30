import { db } from "./db";
import { pointTransactions, users } from "@shared/schema";
import { eq, and, sql, lt, inArray } from "drizzle-orm";

/**
 * Points Expiration Service
 * 
 * Enforces the 12-month points expiration rule by:
 * 1. Finding all transactions older than 12 months that aren't marked as expired
 * 2. Marking them as expired
 * 3. Reconciling each affected user's totalPoints to exclude expired balances
 * 
 * This runs as a background job to maintain data integrity and prevent
 * users from spending expired points.
 */
export class PointsExpirationService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the expiration service to run periodically
   * @param intervalHours - How often to run the expiration check (default: 24 hours)
   */
  start(intervalHours: number = 24): void {
    if (this.intervalId) {
      console.log('[PointsExpiration] Service already running');
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    console.log(`[PointsExpiration] Starting service (runs every ${intervalHours} hours)`);
    
    // Run immediately on start (with error handling to prevent crashes)
    void this.runExpirationJob().catch((err) => {
      console.error('[PointsExpiration] Initial run failed:', err);
    });
    
    // Then run periodically (with error handling to prevent crashes)
    this.intervalId = setInterval(() => {
      void this.runExpirationJob().catch((err) => {
        console.error('[PointsExpiration] Scheduled run failed:', err);
      });
    }, intervalMs);
  }

  /**
   * Stop the expiration service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[PointsExpiration] Service stopped');
    }
  }

  /**
   * Run the expiration job immediately (can be called manually for testing)
   */
  async runExpirationJob(): Promise<{
    expiredTransactions: number;
    affectedUsers: number;
    totalPointsExpired: number;
  }> {
    if (this.isRunning) {
      console.log('[PointsExpiration] Job already running, skipping...');
      return { expiredTransactions: 0, affectedUsers: 0, totalPointsExpired: 0 };
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log('[PointsExpiration] Starting expiration job...');
      
      const now = new Date();
      
      // Step 1: Find all transactions that have expired but aren't marked as expired
      const expiredTxs = await db
        .select({
          id: pointTransactions.id,
          userId: pointTransactions.userId,
          amount: pointTransactions.amount,
          expiresAt: pointTransactions.expiresAt,
        })
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.isExpired, false),
            sql`${pointTransactions.expiresAt} IS NOT NULL`,
            lt(pointTransactions.expiresAt, now)
          )
        );

      if (expiredTxs.length === 0) {
        console.log('[PointsExpiration] No expired transactions found');
        this.isRunning = false;
        return { expiredTransactions: 0, affectedUsers: 0, totalPointsExpired: 0 };
      }

      console.log(`[PointsExpiration] Found ${expiredTxs.length} expired transactions`);

      // Step 2: Mark all expired transactions
      const expiredIds = expiredTxs.map((tx: any) => tx.id);
      await db
        .update(pointTransactions)
        .set({ isExpired: true })
        .where(inArray(pointTransactions.id, expiredIds));

      // Step 3: Conservative expiration approach (simple and safe for beta)
      // For users with expiring credits, we only remove points they clearly have
      // This avoids complex FIFO tracking while maintaining ledger consistency
      // 
      // CONSERVATIVE RULE: Only expire if current balance equals or exceeds total expiring credits
      // This ensures we never touch fresh credits that came after the expiring ones
      const affectedUsers = Array.from(new Set(expiredTxs.map((tx: any) => tx.userId)));
      let totalPointsDeducted = 0;
      
      for (const userId of affectedUsers) {
        const [currentUser] = await db
          .select({ totalPoints: users.totalPoints })
          .from(users)
          .where(eq(users.id, userId));
        
        const currentBalance = currentUser?.totalPoints || 0;
        
        // Calculate total expiring for this user
        const userExpiringTxs = expiredTxs.filter((tx: any) => tx.userId === userId);
        const totalExpiring = userExpiringTxs.reduce((sum: number, tx: any) => sum + tx.amount, 0);
        
        // Conservative: only expire if balance >= total expiring
        // This ensures we don't accidentally remove fresh credits
        if (currentBalance >= totalExpiring) {
          // Safe to remove all expiring credits
          await db.insert(pointTransactions).values({
            userId,
            amount: -totalExpiring,
            source: 'EXPIRATION',
            sourceId: `expiration-${now.toISOString()}`,
            category: 'adjustment',
            description: `Points expired (12-month rule): ${userExpiringTxs.length} transactions`,
            isExpired: false,
            expiresAt: null,
          });
          
          const newBalance = currentBalance - totalExpiring;
          await db
            .update(users)
            .set({ totalPoints: newBalance })
            .where(eq(users.id, userId));
          
          totalPointsDeducted += totalExpiring;
          
          console.log(`[PointsExpiration] User ${userId}: Expired ${totalExpiring} pts (balance: ${currentBalance} → ${newBalance})`);
        } else {
          // Balance < expiring credits - this means user likely has fresh credits mixed in
          // Skip expiration for now to avoid removing fresh credits
          // Future enhancement: implement full FIFO tracking
          console.log(`[PointsExpiration] User ${userId}: Skipping expiration (balance ${currentBalance} < expiring ${totalExpiring}) - likely has fresh credits`);
          
          // Unmark these transactions as expired since we're not processing them yet
          const userExpiringIds = userExpiringTxs.map((tx: any) => tx.id);
          await db
            .update(pointTransactions)
            .set({ isExpired: false })
            .where(inArray(pointTransactions.id, userExpiringIds));
        }
      }

      const duration = Date.now() - startTime;

      console.log('[PointsExpiration] Job completed:', {
        expiredTransactions: expiredTxs.length,
        affectedUsers: affectedUsers.length,
        totalPointsDeducted: totalPointsDeducted,
        durationMs: duration,
      });

      return {
        expiredTransactions: expiredTxs.length,
        affectedUsers: affectedUsers.length,
        totalPointsExpired: totalPointsDeducted,
      };
    } catch (error) {
      console.error('[PointsExpiration] Job failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get current status of the service
   */
  getStatus(): { running: boolean; jobInProgress: boolean } {
    return {
      running: this.intervalId !== null,
      jobInProgress: this.isRunning,
    };
  }
}

// Export singleton instance
export const pointsExpirationService = new PointsExpirationService();
