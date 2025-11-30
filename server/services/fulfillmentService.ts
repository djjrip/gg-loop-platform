import { db } from "../db";
import {
  rewardClaims,
  rewardTypes,
  fulfillmentMetrics,
  auditLog,
  users,
  RewardClaim,
  UpdateRewardClaim,
} from "@shared/schema";
import { eq, desc, and, sql, asc as drizzleAsc } from "drizzle-orm";

export interface MissionControlMetrics {
  totalClaims: number;
  pendingClaims: number;
  totalUsdSpent: number;
  fulfillmentRate: number;
  topRewardTypes: Array<{ type: string; count: number }>;
  streamerMetrics: Array<{
    userId: string;
    displayName: string;
    claimCount: number;
  }>;
}

export interface UserClaimMetrics {
  userId: string;
  displayName: string;
  email: string;
  totalClaims: number;
  fulfilledClaims: number;
  pendingClaims: number;
  totalUsdValue: number;
  claimHistory: RewardClaim[];
}

export class FulfillmentService {
  /**
   * Create a new reward claim for a user
   * Assumes points have already been validated/deducted
   */
  async createRewardClaim(
    userId: string,
    rewardTypeId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RewardClaim> {
    // Fetch user and reward type for denormalization
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const userRecord = userResult[0];

    const rewardResult = await db.select().from(rewardTypes).where(eq(rewardTypes.id, rewardTypeId));
    const rewardType = rewardResult[0];

    if (!userRecord || !rewardType) {
      throw new Error("Invalid user or reward type");
    }

    // Create the claim
    const claim = await db
      .insert(rewardClaims)
      .values({
        userId,
        rewardTypeId,
        status: "pending",
        pointsSpent: rewardType.pointsCost,
        userEmail: userRecord.email || undefined,
        userDisplayName: userRecord.username || undefined,
        ipAddress,
        userAgent,
      })
      .returning();

    return claim[0];
  }

  /**
   * Update a claim status (fulfill or reject)
   */
  async updateClaimStatus(
    claimId: string,
    adminUserId: string,
    update: UpdateRewardClaim
  ): Promise<RewardClaim> {
    const existingClaim = await db.query.rewardClaims.findFirst({
      where: eq(rewardClaims.id, claimId),
    });

    if (!existingClaim) {
      throw new Error("Claim not found");
    }

    const updateData: any = {
      status: update.status,
      updatedAt: new Date(),
    };

    if (update.status === "fulfilled") {
      updateData.fulfilledBy = adminUserId;
      updateData.fulfilledAt = new Date();
      updateData.fulfillmentMethod = update.fulfillmentMethod;
      updateData.fulfillmentData = update.fulfillmentData;
      updateData.fulfillmentNotes = update.fulfillmentNotes;
    }

    if (update.status === "rejected") {
      updateData.rejectedBy = adminUserId;
      updateData.rejectedAt = new Date();
      updateData.rejectedReason = update.rejectedReason;
    }

    if (update.status === "in_progress") {
      updateData.fulfillmentMethod = update.fulfillmentMethod;
      updateData.adminNotes = update.fulfillmentNotes;
    }

    const updated = await db
      .update(rewardClaims)
      .set(updateData)
      .where(eq(rewardClaims.id, claimId))
      .returning();

    return updated[0];
  }

  /**
   * Get mission control dashboard metrics
   */
  async getMissionControlMetrics(): Promise<MissionControlMetrics> {
    // Total counts
    const claimStats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        fulfilled: sql<number>`sum(case when status = 'fulfilled' then 1 else 0 end)`,
        rejected: sql<number>`sum(case when status = 'rejected' then 1 else 0 end)`,
        totalUsdSpent: sql<number>`coalesce(sum(case when status = 'fulfilled' then rt.real_value else 0 end), 0)`,
      })
      .from(rewardClaims)
      .leftJoin(rewardTypes, eq(rewardClaims.rewardTypeId, rewardTypes.id));

    const stats = claimStats[0];
    const totalClaims = Number(stats.total || 0);
    const pendingClaims = Number(stats.pending || 0);
    const fulfilledClaims = Number(stats.fulfilled || 0);
    const totalUsdSpent = Number(stats.totalUsdSpent || 0);

    const fulfillmentRate =
      totalClaims > 0 ? Math.round((fulfilledClaims / totalClaims) * 100) : 0;

    // Top reward types
    const topTypes = await db
      .select({
        type: rewardTypes.type,
        count: sql<number>`count(${rewardClaims.id})`,
      })
      .from(rewardClaims)
      .leftJoin(rewardTypes, eq(rewardClaims.rewardTypeId, rewardTypes.id))
      .groupBy(rewardTypes.type)
      .orderBy(desc(sql`count(${rewardClaims.id})`))
      .limit(10);

    // Streamer metrics (top streamers by claim count)
    const streamerMetrics = await db
      .select({
        userId: users.id,
        displayName: users.username,
        claimCount: sql<number>`count(${rewardClaims.id})`,
      })
      .from(rewardClaims)
      .leftJoin(users, eq(rewardClaims.userId, users.id))
      .where(eq(users.isStreamer, true))
      .groupBy(users.id, users.username)
      .orderBy(desc(sql`count(${rewardClaims.id})`))
      .limit(10);

    return {
      totalClaims,
      pendingClaims,
      totalUsdSpent,
      fulfillmentRate,
      topRewardTypes: topTypes
        .filter((t) => t.type)
        .map((t) => ({
          type: t.type!,
          count: Number(t.count || 0),
        })),
      streamerMetrics: streamerMetrics
        .filter((s) => s.displayName)
        .map((s) => ({
          userId: s.userId,
          displayName: s.displayName!,
          claimCount: Number(s.claimCount || 0),
        })),
    };
  }

  /**
   * Get detailed metrics for a specific user
   */
  async getUserClaimMetrics(userId: string): Promise<UserClaimMetrics> {
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const user = userResult[0];

    if (!user) {
      throw new Error("User not found");
    }

    const claims = await db.select().from(rewardClaims).where(eq(rewardClaims.userId, userId));

    const stats = {
      totalClaims: claims.length,
      fulfilledClaims: claims.filter((c) => c.status === "fulfilled").length,
      pendingClaims: claims.filter((c) => c.status === "pending").length,
      totalUsdValue: claims.reduce((sum, c) => {
        // Approximate: use pointsSpent / 2 as USD equivalent
        // Better: join with reward types for real values
        return sum + (c.pointsSpent / 2);
      }, 0),
    };

    return {
      userId,
      displayName: user.username || "Unknown",
      email: user.email || "unknown@example.com",
      totalClaims: stats.totalClaims,
      fulfilledClaims: stats.fulfilledClaims,
      pendingClaims: stats.pendingClaims,
      totalUsdValue: stats.totalUsdValue,
      claimHistory: claims,
    };
  }

  /**
   * Get all pending claims (for ops queue)
   */
  async getPendingClaims(limit: number = 50, offset: number = 0): Promise<{
    claims: RewardClaim[];
    total: number;
  }> {
    const claims = await db.select().from(rewardClaims)
      .where(eq(rewardClaims.status, "pending"))
      .orderBy(drizzleAsc(rewardClaims.claimedAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(rewardClaims)
      .where(eq(rewardClaims.status, "pending"));

    const total = Number(totalResult[0]?.count || 0);

    return { claims, total };
  }

  /**
   * Get all claims with filtering and pagination
   */
  async getClaimsFiltered(
    filters: {
      status?: string;
      userId?: string;
      rewardTypeId?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    claims: RewardClaim[];
    total: number;
  }> {
    const whereConditions: any[] = [];

    if (filters.status) {
      whereConditions.push(eq(rewardClaims.status, filters.status));
    }
    if (filters.userId) {
      whereConditions.push(eq(rewardClaims.userId, filters.userId));
    }
    if (filters.rewardTypeId) {
      whereConditions.push(eq(rewardClaims.rewardTypeId, filters.rewardTypeId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const claims = await db.select().from(rewardClaims)
      .where(whereClause)
      .orderBy(desc(rewardClaims.claimedAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(rewardClaims)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    return { claims, total };
  }

  /**
   * Log fulfillment action to audit log
   */
  async logAction(
    adminUserId: string,
    adminEmail: string,
    action: string,
    targetUserId: string,
    details: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await db.insert(auditLog).values({
      adminUserId,
      adminEmail,
      action,
      targetUserId,
      details,
      ipAddress,
    });
  }
}
