#!/usr/bin/env node

/**
 * INNOVATION: Automated referral system
 * Gives users unique referral codes, tracks conversions
 * Incentivizes viral growth with rewards
 */

import { db } from "../server/db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from 'crypto';

function generateReferralCode(username) {
    // Create short, memorable code from username + random
    const base = username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
    const random = crypto.randomBytes(2).toString('hex');
    return `${base}${random}`.toUpperCase();
}

async function setupReferralSystem() {
    console.log('🔗 Setting Up Referral System...\n');

    // Get all users
    const allUsers = await db.select().from(users);

    console.log(`Found ${allUsers.length} users\n`);

    for (const user of allUsers) {
        // Generate referral code if doesn't exist
        if (!user.referralCode) {
            const code = generateReferralCode(user.username || user.id);

            await db
                .update(users)
                .set({ referralCode: code })
                .where(eq(users.id, user.id));

            console.log(`✅ ${user.username || user.id}: ${code}`);
            console.log(`   Share link: https://ggloop.io?ref=${code}\n`);
        } else {
            console.log(`✓ ${user.username || user.id}: ${user.referralCode} (already set)`);
        }
    }

    console.log('\n📊 REFERRAL SYSTEM SETUP COMPLETE\n');
    console.log('Next Steps:');
    console.log('1. Add referral link to user dashboard');
    console.log('2. Show "Invite friends, earn points" CTA');
    console.log('3. Track referral conversions');
    console.log('4. Reward successful referrals\n');

    console.log('Suggested Rewards:');
    console.log('  • Referrer: 500 points per signup');
    console.log('  • Referred: 250 bonus points');
    console.log('  • Both: 1000 points if referred user subscribes\n');

    console.log('Implementation TODO:');
    console.log('  [ ] Add referralCode column to users table');
    console.log('  [ ] Add referredBy column to track who referred whom');
    console.log('  [ ] Create /api/referral/stats endpoint');
    console.log('  [ ] Add referral section to user dashboard');
    console.log('  [ ] Implement point rewards for successful referrals\n');
}

setupReferralSystem().catch(console.error);

/*
VIRAL LOOP MECHANICS:

1. User signs up
2. Gets unique referral code
3. Shares with friends via:
   - Direct link
   - Social media (pre-filled tweet)
   - Email invite
4. Friend signs up with code
5. Both get bonus points
6. If friend subscribes, both get premium rewards

GROWTH MULTIPLIER:
Each user who refers 2 friends = 3 total users
Viral coefficient > 1 = exponential growth

AUTHENTIC APPROACH:
"5 users now. Help us get to 50. Every referral matters."
Make early users feel like founding members.
*/
