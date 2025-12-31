import { db } from "../database";
import { referrals, users } from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

export const REFERRAL_REWARDS = {
    SIGNUP_BONUS: 50, // Points for the new user
    REFERRER_BONUS: 100 // Points for the referrer
};

export async function processReferralSignup(newUserId: number, referralCode: string) {
    // Check if referral code exists
    const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);

    if (!referrer) return false;
    if (referrer.id === newUserId) return false; // Self-referral

    // Record referral
    await db.insert(referrals).values({
        referrerId: referrer.id,
        referredUserId: newUserId,
        status: "completed",
        rewardPoints: REFERRAL_REWARDS.REFERRER_BONUS,
        createdAt: new Date().toISOString()
    });

    return true;
}

export async function getReferralStats(userId: number) {
    const [stats] = await db
        .select({
            totalReferrals: sql<number>`count(*)`,
            earnedPoints: sql<number>`sum(${referrals.rewardPoints})`
        })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));

    return {
        totalReferrals: Number(stats?.totalReferrals || 0),
        earnedPoints: Number(stats?.earnedPoints || 0)
    };
}
