import { db } from "../database";
import { virtualBadges } from "@shared/schema";
import { eq } from "drizzle-orm";
/**
 * Seed default virtual badges for free tier users
 */
export async function seedDefaultBadges() {
    const badges = [
        // Streak Badges
        {
            id: 'badge_streak_7',
            name: 'Week Warrior',
            description: 'Login 7 days in a row',
            iconUrl: '/badges/streak-7.svg',
            rarity: 'common',
            unlockCondition: 'streak_7',
            ggCoinsReward: 25,
            isActive: true,
        },
        {
            id: 'badge_streak_30',
            name: 'Monthly Marathoner',
            description: 'Login 30 days in a row',
            iconUrl: '/badges/streak-30.svg',
            rarity: 'rare',
            unlockCondition: 'streak_30',
            ggCoinsReward: 100,
            isActive: true,
        },
        {
            id: 'badge_streak_100',
            name: 'Century Champion',
            description: 'Login 100 days in a row',
            iconUrl: '/badges/streak-100.svg',
            rarity: 'legendary',
            unlockCondition: 'streak_100',
            ggCoinsReward: 500,
            isActive: true,
        },
        // Win Badges
        {
            id: 'badge_wins_10',
            name: 'First Blood',
            description: 'Win 10 matches',
            iconUrl: '/badges/wins-10.svg',
            rarity: 'common',
            unlockCondition: 'wins_10',
            ggCoinsReward: 15,
            isActive: true,
        },
        {
            id: 'badge_wins_50',
            name: 'Rising Star',
            description: 'Win 50 matches',
            iconUrl: '/badges/wins-50.svg',
            rarity: 'rare',
            unlockCondition: 'wins_50',
            ggCoinsReward: 50,
            isActive: true,
        },
        {
            id: 'badge_wins_100',
            name: 'Victory Veteran',
            description: 'Win 100 matches',
            iconUrl: '/badges/wins-100.svg',
            rarity: 'epic',
            unlockCondition: 'wins_100',
            ggCoinsReward: 150,
            isActive: true,
        },
        {
            id: 'badge_wins_500',
            name: 'Champion',
            description: 'Win 500 matches',
            iconUrl: '/badges/wins-500.svg',
            rarity: 'legendary',
            unlockCondition: 'wins_500',
            ggCoinsReward: 500,
            isActive: true,
        },
        // Referral Badges
        {
            id: 'badge_referral_1',
            name: 'Recruiter',
            description: 'Refer your first friend',
            iconUrl: '/badges/referral-1.svg',
            rarity: 'common',
            unlockCondition: 'referral_1',
            ggCoinsReward: 20,
            isActive: true,
        },
        {
            id: 'badge_referral_5',
            name: 'Squad Leader',
            description: 'Refer 5 friends',
            iconUrl: '/badges/referral-5.svg',
            rarity: 'rare',
            unlockCondition: 'referral_5',
            ggCoinsReward: 100,
            isActive: true,
        },
        {
            id: 'badge_referral_25',
            name: 'Community Builder',
            description: 'Refer 25 friends',
            iconUrl: '/badges/referral-25.svg',
            rarity: 'legendary',
            unlockCondition: 'referral_25',
            ggCoinsReward: 750,
            isActive: true,
        },
        // Special Badges
        {
            id: 'badge_trial_unlocked',
            name: 'Trial Unlocked',
            description: 'Unlocked your first Basic trial',
            iconUrl: '/badges/trial.svg',
            rarity: 'rare',
            unlockCondition: 'trial_unlocked',
            ggCoinsReward: 0,
            isActive: true,
        },
        {
            id: 'badge_twitch_linked',
            name: 'Streamer',
            description: 'Connected your Twitch account',
            iconUrl: '/badges/twitch.svg',
            rarity: 'common',
            unlockCondition: 'twitch_linked',
            ggCoinsReward: 10,
            isActive: true,
        },
    ];
    for (const badge of badges) {
        // Check if badge already exists
        const existing = await db
            .select()
            .from(virtualBadges)
            .where(eq(virtualBadges.id, badge.id))
            .limit(1);
        if (existing.length === 0) {
            await db.insert(virtualBadges).values(badge);
            console.log(`✓ Seeded badge: ${badge.name}`);
        }
    }
    console.log('✓ All badges seeded');
}
