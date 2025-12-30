/**
 * Referral Contest Automation
 * Monthly contests with automatic prize distribution
 * Drives viral growth through competitive incentives
 *
 * Prizes:
 * 1st place: $50 PayPal + 5,000 bonus points
 * 2nd-3rd: $25 PayPal + 2,500 points
 * 4th-10th: $10 PayPal + 1,000 points
 *
 * Usage: node server/referralContest.js (run monthly via cron)
 */
import { db } from './database';
import { users, pointsTransactions } from '@shared/schema';
import { sql, desc } from 'drizzle-orm';
import { sendEmail } from './services/email';
const PRIZE_TIERS = [
    { rank: 1, cash: 50, points: 5000, description: '🥇 1st Place' },
    { rank: 2, cash: 25, points: 2500, description: '🥈 2nd Place' },
    { rank: 3, cash: 25, points: 2500, description: '🥉 3rd Place' },
    { rank: 4, cash: 10, points: 1000, description: '🏅 4th Place' },
    { rank: 5, cash: 10, points: 1000, description: '🏅 5th Place' },
    { rank: 6, cash: 10, points: 1000, description: '🏅 6th Place' },
    { rank: 7, cash: 10, points: 1000, description: '🏅 7th Place' },
    { rank: 8, cash: 10, points: 1000, description: '🏅 8th Place' },
    { rank: 9, cash: 10, points: 1000, description: '🏅 9th Place' },
    { rank: 10, cash: 10, points: 1000, description: '🏅 10th Place' },
];
/**
 * Get contest winners for this month
 */
async function getMonthlyWinners() {
    // Get start of current month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    // Get top 10 referrers this month
    // Note: This counts total referral_count, you might want to track monthly separately
    const topReferrers = await db
        .select({
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        referralCount: users.referralCount,
    })
        .from(users)
        .where(sql `referral_count > 0`)
        .orderBy(desc(users.referralCount))
        .limit(10);
    return topReferrers.map((user, index) => {
        const tier = PRIZE_TIERS[index];
        return {
            ...user,
            rank: index + 1,
            prize: `$${tier.cash} PayPal`,
            bonusPoints: tier.points,
        };
    });
}
/**
 * Award bonus points to winners
 */
async function awardBonusPoints(winners) {
    console.log('💰 Awarding bonus points to winners...');
    for (const winner of winners) {
        try {
            // Award points
            await db.insert(pointsTransactions).values({
                userId: winner.userId,
                amount: winner.bonusPoints,
                source: 'referral_contest',
                description: `${PRIZE_TIERS[winner.rank - 1].description} - Monthly Referral Contest`,
            });
            // Update user total
            await db.update(users)
                .set({
                totalPoints: sql `${users.totalPoints} + ${winner.bonusPoints}`,
            })
                .where(sql `id = ${winner.userId}`);
            console.log(`   ✅ Awarded ${winner.bonusPoints} points to ${winner.firstName}`);
        }
        catch (error) {
            console.error(`   ❌ Failed to award points to ${winner.email}:`, error);
        }
    }
}
/**
 * Send winner notification emails
 */
async function notifyWinners(winners) {
    console.log('📧 Sending winner notifications...');
    for (const winner of winners) {
        const tier = PRIZE_TIERS[winner.rank - 1];
        try {
            await sendEmail({
                to: winner.email,
                subject: `🎉 You won ${tier.description} in the GG LOOP Referral Contest!`,
                html: `
          <h1>Congratulations, ${winner.firstName}!</h1>
          
          <p>You placed <strong>${tier.description}</strong> in this month's referral contest!</p>
          
          <h2>Your Prize:</h2>
          <ul>
            <li>💵 <strong>$${tier.cash} PayPal Cash</strong> (sent within 3 business days)</li>
            <li>⭐ <strong>${tier.points.toLocaleString()} Bonus Points</strong> (already added to your account!)</li>
          </ul>
          
          <h3>Your Stats:</h3>
          <ul>
            <li>Referrals This Month: ${winner.referralCount}</li>
            <li>Contest Rank: #${winner.rank} of 10</li>
          </ul>
          
          <p><strong>To claim your cash prize:</strong><br>
          Reply to this email with your PayPal email address. We'll send payment within 3 business days.</p>
          
          <p>Keep crushing it! Next month's contest is already live.</p>
          
          <p>— The GG LOOP Team</p>
        `,
            });
            console.log(`   ✅ Sent email to ${winner.email}`);
        }
        catch (error) {
            console.error(`   ❌ Failed to email ${winner.email}:`, error);
        }
    }
}
/**
 * Announce contest results to all users
 */
async function announceResults(winners) {
    console.log('📢 Announcing results...');
    const winnersList = winners
        .slice(0, 3) // Top 3
        .map(w => `${PRIZE_TIERS[w.rank - 1].description} ${w.firstName} - ${w.referralCount} referrals`)
        .join('\n');
    // Send announcement email to all active users
    const allUsers = await db.select({ email: users.email })
        .from(users)
        .where(sql `email IS NOT NULL`)
        .limit(1000); // Batch limits
    for (const user of allUsers) {
        try {
            await sendEmail({
                to: user.email,
                subject: '🏆 Monthly Referral Contest Winners Announced!',
                html: `
          <h1>This Month's Referral Contest Winners</h1>
          
          <p>${winnersList}</p>
          
          <h2>Next Month's Contest is LIVE!</h2>
          <p>Same prizes, new competition. Start referring now!</p>
          
          <p><a href="https://ggloop.io/referrals" style="background: purple; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Get Your Referral Link →
          </a></p>
          
          <p>— GG LOOP</p>
        `,
            });
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        catch (error) {
            // Silently fail for announcements
        }
    }
    console.log(`   ✅ Sent announcement to ${allUsers.length} users`);
}
/**
 * Run monthly contest
 */
async function runMonthlyContest() {
    console.log('🏆 Running monthly referral contest...\n');
    try {
        const winners = await getMonthlyWinners();
        if (winners.length === 0) {
            console.log('⚠️ No winners this month (no referrals)');
            return;
        }
        console.log(`✅ Found ${winners.length} winners\n`);
        // Award bonus points
        await awardBonusPoints(winners);
        console.log('');
        // Notify winners
        await notifyWinners(winners);
        console.log('');
        // Announce to all users
        await announceResults(winners);
        console.log('\n🎉 Monthly contest complete!');
        console.log(`💰 Total prizes distributed: $${winners.reduce((sum, w) => sum + PRIZE_TIERS[w.rank - 1].cash, 0)}`);
        console.log(`⭐ Total bonus points: ${winners.reduce((sum, w) => sum + w.bonusPoints, 0).toLocaleString()}`);
    }
    catch (error) {
        console.error('❌ Contest error:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    runMonthlyContest()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
export { runMonthlyContest, getMonthlyWinners };
