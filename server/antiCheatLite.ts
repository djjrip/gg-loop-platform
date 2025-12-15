import { db } from "./db";
import { users, xpTransactions, fraudAlerts } from "@db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

// Rate limit configuration
const RATE_LIMITS = {
  XP_SYNC_PER_HOUR: 10,
  MATCH_VERIFY_PER_HOUR: 5,
  MAX_XP_PER_SYNC: 1000
};

// Cooldown durations (milliseconds)
const COOLDOWNS = {
  BETWEEN_SYNCS: 5 * 60 * 1000, // 5 minutes
  AFTER_SUSPICIOUS: 10 * 60 * 1000, // 10 minutes
  AFTER_FRAUD_FLAG: 60 * 60 * 1000 // 1 hour
};

// Velocity thresholds
const VELOCITY_LIMITS = {
  MAX_XP_PER_HOUR: 2000,
  MAX_XP_PER_DAY: 10000
};

// Fraud score impacts
const FRAUD_SCORE_IMPACT = {
  RATE_LIMIT: 5,
  COOLDOWN_BYPASS: 10,
  VELOCITY_CHECK: 10,
  DUPLICATE: 15,
  TIME_TRAVEL: 20,
  MULTIPLE_VIOLATIONS: 25
};

export interface RateLimitState {
  userId: number;
  xpSyncCount: number;
  matchVerifyCount: number;
  lastXpSync: Date | null;
  lastMatchVerify: Date | null;
  cooldownUntil: Date | null;
  windowStart: Date;
}

export interface AntiCheatViolation {
  userId: number;
  violationType: string;
  severity: string;
  evidence: any;
  fraudScoreImpact: number;
}

// Get or create rate limit state
export async function getRateLimitState(userId: number): Promise<RateLimitState> {
  // Check if state exists in memory or DB
  const state = await db.query.rateLimitState?.findFirst({
    where: eq(users.id, userId)
  });

  if (state) {
    return state as RateLimitState;
  }

  // Create new state
  return {
    userId,
    xpSyncCount: 0,
    matchVerifyCount: 0,
    lastXpSync: null,
    lastMatchVerify: null,
    cooldownUntil: null,
    windowStart: new Date()
  };
}

// Check if user is in cooldown
export async function checkCooldown(userId: number): Promise<{ inCooldown: boolean; remainingMs: number }> {
  const state = await getRateLimitState(userId);
  
  if (!state.cooldownUntil) {
    return { inCooldown: false, remainingMs: 0 };
  }

  const now = new Date();
  const cooldownEnd = new Date(state.cooldownUntil);
  
  if (now < cooldownEnd) {
    return {
      inCooldown: true,
      remainingMs: cooldownEnd.getTime() - now.getTime()
    };
  }

  return { inCooldown: false, remainingMs: 0 };
}

// Check rate limit
export async function checkRateLimit(userId: number, action: 'xpSync' | 'matchVerify'): Promise<boolean> {
  const state = await getRateLimitState(userId);
  const now = new Date();
  const windowDuration = 60 * 60 * 1000; // 1 hour

  // Reset window if expired
  if (now.getTime() - state.windowStart.getTime() > windowDuration) {
    state.xpSyncCount = 0;
    state.matchVerifyCount = 0;
    state.windowStart = now;
  }

  // Check limits
  if (action === 'xpSync' && state.xpSyncCount >= RATE_LIMITS.XP_SYNC_PER_HOUR) {
    await logViolation(userId, 'RATE_LIMIT', 'MEDIUM', {
      action,
      count: state.xpSyncCount,
      limit: RATE_LIMITS.XP_SYNC_PER_HOUR
    }, FRAUD_SCORE_IMPACT.RATE_LIMIT);
    return false;
  }

  if (action === 'matchVerify' && state.matchVerifyCount >= RATE_LIMITS.MATCH_VERIFY_PER_HOUR) {
    await logViolation(userId, 'RATE_LIMIT', 'MEDIUM', {
      action,
      count: state.matchVerifyCount,
      limit: RATE_LIMITS.MATCH_VERIFY_PER_HOUR
    }, FRAUD_SCORE_IMPACT.RATE_LIMIT);
    return false;
  }

  return true;
}

// Check velocity (impossible XP gains)
export async function checkVelocity(userId: number, xpAmount: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentXP = await db
    .select({ total: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)` })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, oneHourAgo)
      )
    );

  const totalXP = (recentXP[0]?.total || 0) + xpAmount;

  if (totalXP > VELOCITY_LIMITS.MAX_XP_PER_HOUR) {
    await logViolation(userId, 'VELOCITY', 'HIGH', {
      xpInLastHour: recentXP[0]?.total || 0,
      attemptedXP: xpAmount,
      total: totalXP,
      limit: VELOCITY_LIMITS.MAX_XP_PER_HOUR
    }, FRAUD_SCORE_IMPACT.VELOCITY_CHECK);
    return false;
  }

  return true;
}

// Check for duplicate submissions
export async function checkDuplicate(userId: number, sessionId: string): Promise<boolean> {
  const existing = await db.query.xpTransactions.findFirst({
    where: and(
      eq(xpTransactions.userId, userId),
      sql`${xpTransactions.metadata}->>'sessionId' = ${sessionId}`
    )
  });

  if (existing) {
    await logViolation(userId, 'DUPLICATE', 'HIGH', {
      sessionId,
      existingTransaction: existing.id
    }, FRAUD_SCORE_IMPACT.DUPLICATE);
    return false;
  }

  return true;
}

// Log violation
async function logViolation(
  userId: number,
  violationType: string,
  severity: string,
  evidence: any,
  fraudScoreImpact: number
): Promise<void> {
  // Log to fraudAlerts table
  await db.insert(fraudAlerts).values({
    userId,
    alertType: violationType,
    severity,
    description: `Anti-cheat violation: ${violationType}`,
    metadata: evidence,
    createdAt: new Date()
  });

  // Increment fraud score
  await incrementFraudScore(userId, fraudScoreImpact);
}

// Increment fraud score
async function incrementFraudScore(userId: number, amount: number): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) return;

  const newScore = (user.fraudScore || 0) + amount;

  await db.update(users)
    .set({ fraudScore: newScore })
    .where(eq(users.id, userId));

  // Auto-ban at score 100
  if (newScore >= 100) {
    await db.update(users)
      .set({ banned: true })
      .where(eq(users.id, userId));
  }
}

// Main validation function
export async function validateXPSync(
  userId: number,
  xpAmount: number,
  sessionId: string
): Promise<{ valid: boolean; reason?: string; cooldownMs?: number }> {
  // Check cooldown
  const cooldownCheck = await checkCooldown(userId);
  if (cooldownCheck.inCooldown) {
    return {
      valid: false,
      reason: 'Account is on cooldown',
      cooldownMs: cooldownCheck.remainingMs
    };
  }

  // Check rate limit
  const rateLimitOk = await checkRateLimit(userId, 'xpSync');
  if (!rateLimitOk) {
    return {
      valid: false,
      reason: 'Rate limit exceeded (max 10 syncs per hour)'
    };
  }

  // Check velocity
  const velocityOk = await checkVelocity(userId, xpAmount);
  if (!velocityOk) {
    return {
      valid: false,
      reason: 'XP gain rate too high (max 2000 XP/hour)'
    };
  }

  // Check duplicate
  const duplicateOk = await checkDuplicate(userId, sessionId);
  if (!duplicateOk) {
    return {
      valid: false,
      reason: 'Duplicate session detected'
    };
  }

  // Check XP amount
  if (xpAmount > RATE_LIMITS.MAX_XP_PER_SYNC) {
    await logViolation(userId, 'EXCESSIVE_XP', 'HIGH', {
      amount: xpAmount,
      limit: RATE_LIMITS.MAX_XP_PER_SYNC
    }, FRAUD_SCORE_IMPACT.VELOCITY_CHECK);
    return {
      valid: false,
      reason: `XP amount exceeds maximum (${RATE_LIMITS.MAX_XP_PER_SYNC})`
    };
  }

  return { valid: true };
}
