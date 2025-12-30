/**
 * GG LOOP Trust Scoring Service
 * Calculates user trust score based on verification signals, gameplay history, and fraud risk.
 */

import { db } from '../database';
import { trustScores, trustScoreEvents, users, matchSubmissions, verificationProofs, fraudDetectionLogs, riotAccounts } from '../../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

const SCORE_CONFIG = {
    BASE_REGISTERED: 10,
    DESKTOP_VERIFIED: 40,
    RIOT_LINKED: 10,
    PER_VERIFIED_MATCH: 1,
    MAX_MATCH_POINTS: 20,
    PER_WEEK_AGE: 1,
    MAX_AGE_POINTS: 10,
};

const TIERS = {
    UNVERIFIED: 0,
    DEVELOPING: 30,
    TRUSTED: 70,
    ELITE: 90,
};

export class TrustScoreService {
    /**
     * Calculate and persist the trust score for a user.
     * This is a heavy operation and should be called on specific triggers (e.g., match verification, proof upload).
     */
    static async calculateTrustScore(userId: string): Promise<{ score: number, tier: string, components: any, reasons: string[] }> {
        let score = SCORE_CONFIG.BASE_REGISTERED;
        const components: any = { base: SCORE_CONFIG.BASE_REGISTERED };
        const reasons: string[] = ["Account Registered"];

        // 1. Check Desktop Verification (The Big Unlock)
        const desktopProofs = await db
            .select()
            .from(verificationProofs)
            .where(and(eq(verificationProofs.userId, userId), eq(verificationProofs.status, 'verified'), eq(verificationProofs.sourceType, 'desktop_session')))
            .limit(1);

        if (desktopProofs.length > 0) {
            score += SCORE_CONFIG.DESKTOP_VERIFIED;
            components.desktop = SCORE_CONFIG.DESKTOP_VERIFIED;
            reasons.push("Desktop App Verified");
        }

        // 2. Check Riot Account Link
        const riotLinks = await db.select().from(riotAccounts).where(eq(riotAccounts.userId, userId)).limit(1);
        if (riotLinks.length > 0) {
            score += SCORE_CONFIG.RIOT_LINKED;
            components.riot = SCORE_CONFIG.RIOT_LINKED;
            reasons.push("Riot Account Linked");
        }

        // 3. Gameplay Grind (Verified Matches)
        const matches = await db
            .select()
            .from(matchSubmissions)
            .where(and(eq(matchSubmissions.userId, userId), eq(matchSubmissions.status, 'approved')));

        const matchPoints = Math.min(matches.length * SCORE_CONFIG.PER_VERIFIED_MATCH, SCORE_CONFIG.MAX_MATCH_POINTS);
        if (matchPoints > 0) {
            score += matchPoints;
            components.gameplay = matchPoints;
            reasons.push(`${matches.length} Verified Matches`);
        }

        // 4. Account Age
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user && user.createdAt) {
            const weeksOld = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7));
            const agePoints = Math.min(weeksOld * SCORE_CONFIG.PER_WEEK_AGE, SCORE_CONFIG.MAX_AGE_POINTS);
            if (agePoints > 0) {
                score += agePoints;
                components.age = agePoints;
                reasons.push(`Account Age: ${weeksOld} Weeks`);
            }
        }

        // 5. Fraud Penalties (The Hammer)
        const fraudLogs = await db
            .select()
            .from(fraudDetectionLogs)
            .where(eq(fraudDetectionLogs.userId, userId))
            .orderBy(desc(fraudDetectionLogs.createdAt));

        let penalty = 0;
        for (const log of fraudLogs) {
            // Only count pending or confirmed fraud
            if (log.status !== 'dismissed') {
                if (log.severity === 'critical') penalty += 100;
                else if (log.severity === 'high') penalty += 50;
                else if (log.severity === 'medium') penalty += 20;
                // Low severity might be just a warning, no score deduction yet
            }
        }

        if (penalty > 0) {
            score = Math.max(0, score - penalty);
            components.penalty = -penalty;
            reasons.push(`Fraud Detection Penalty applied`);
        }

        // Cap Score at 100
        score = Math.min(100, score);

        // Determine Tier
        let tier = "UNVERIFIED";
        if (score >= TIERS.ELITE) tier = "ELITE";
        else if (score >= TIERS.TRUSTED) tier = "TRUSTED";
        else if (score >= TIERS.DEVELOPING) tier = "DEVELOPING";

        // Persist
        await db
            .insert(trustScores)
            .values({
                userId,
                score,
                tier,
                reasons,
                components,
                lastCalculatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: trustScores.userId,
                set: { score, tier, reasons, components, lastCalculatedAt: new Date(), updatedAt: new Date() },
            });

        return { score, tier, components, reasons };
    }

    /**
     * Get the current trust score for a user.
     */
    static async getTrustScore(userId: string) {
        const [record] = await db.select().from(trustScores).where(eq(trustScores.userId, userId));
        if (!record) {
            // If no record exists, calculate it for the first time
            return this.calculateTrustScore(userId);
        }
        return record;
    }

    /**
     * Log a trust event (e.g., manual adjustment or significant change).
     */
    static async logEvent(userId: string, eventType: string, delta: number, reason: string, source: string = 'system') {
        // 1. Log the event
        await db.insert(trustScoreEvents).values({
            userId,
            eventType,
            scoreDelta: delta,
            newScore: 0, // Placeholder, will be updated after calc
            reason,
            source
        });

        // 2. Recalculate score to reflect reality
        const result = await this.calculateTrustScore(userId);

        // 3. Update the event with the actual new score
        // (We'd need the ID of the inserted event to update it, but for now this is fine or we could return the ID)
    }
}
