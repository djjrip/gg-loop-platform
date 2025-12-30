/**
 * FOUNDING 1000 BADGE SYSTEM
 * Give first 1000 users special status + perks
 * Shows platform is growing, rewards early believers
 */

import { db } from '../database';
import { users } from '@db/schema';
import { sql, eq } from 'drizzle-orm';

export interface FoundingMemberBadge {
    userId: number;
    badgeNumber: number; // 1-1000
    grantedAt: Date;
    perks: string[];
}

// ============================================
// CHECK IF USER GETS FOUNDING MEMBER STATUS
// ============================================

export async function checkAndGrantFoundingMember(userId: number): Promise<FoundingMemberBadge | null> {
    // Count total users
    const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

    const userCount = Number(totalUsers[0]?.count || 0);

    // If we're past 1000 users, no more founding members
    if (userCount > 1000) {
        return null;
    }

    // Grant founding member status
    const badge: FoundingMemberBadge = {
        userId,
        badgeNumber: userCount,
        grantedAt: new Date(),
        perks: [
            'Lifetime 10% points bonus',
            'Exclusive "Founding 1000" badge',
            'Early access to new features',
            'Direct line to founder',
            'Locked-in pricing (no price increases)',
            'Special role in Discord',
        ],
    };

    // Store in user metadata
    await db
        .update(users)
        .set({
            metadata: sql`json_set(metadata, '$.foundingMember', ${JSON.stringify(badge)})`,
        })
        .where(eq(users.id, userId));

    console.log(`✅ Granted Founding Member #${badge.badgeNumber} to user ${userId}`);

    return badge;
}

// ============================================
// GET FOUNDING MEMBER INFO
// ============================================

export async function getFoundingMemberStatus(userId: number): Promise<FoundingMemberBadge | null> {
    const user = await db
        .select({ metadata: users.metadata })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user[0]?.metadata) return null;

    const metadata = JSON.parse(user[0].metadata as string);
    return metadata.foundingMember || null;
}

// ============================================
// FOUNDING MEMBER WELCOME EMAIL
// ============================================

export function generateFoundingMemberEmail(badgeNumber: number, username: string): string {
    return `
Hey ${username},

You're Founding Member #${badgeNumber} of GG LOOP. 

Out of potentially thousands, you're one of the first 1000 to believe in what we're building.

Here's what that means for you:

🎖️ FOUNDING 1000 PERKS:
• Lifetime 10% points bonus (forever)
• Exclusive "Founding 1000" badge on your profile
• Early access to every new feature we ship
• Your pricing is locked in (no increases, ever)
• Direct line to me (the founder) for feedback
• Special founder role in our Discord

WHY THIS MATTERS:
Most platforms forget their early believers. We don't. You took a chance on us when we were just getting started. These perks are permanent - our way of saying thank you.

As we grow (and we will), you'll always have founder status. When we hit 10K users, 100K users, beyond - you were here at the beginning.

Welcome to the Founding 1000.

- Jayson
Founder, GG LOOP

P.S. - Your badge number is #${badgeNumber}. Lower numbers = earlier adopter. You're part of gaming rewards history now.
  `.trim();
}

// ============================================
// SHOW REMAINING FOUNDING SPOTS
// ============================================

export async function getFoundingSpotsRemaining(): Promise<number> {
    const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

    const userCount = Number(totalUsers[0]?.count || 0);

    return Math.max(0, 1000 - userCount);
}

export { FoundingMemberBadge };
