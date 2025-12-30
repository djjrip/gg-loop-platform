/**
 * Daily Login Quest Seed Script
 * Adds a single daily login streak quest to the database
 *
 * Usage: npx tsx server/seed-daily-login-quest.ts
 */
import { db } from './database';
import { challenges } from '@shared/schema';
import crypto from 'crypto';
async function seedDailyLoginQuest() {
    console.log('🎯 Seeding Daily Login Quest...');
    try {
        // Create a daily login quest that runs for 1 year
        const now = Date.now(); // Use Unix timestamp
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
        const questData = {
            id: crypto.randomUUID(),
            title: 'Daily Login Streak',
            description: 'Log in every day to earn bonus points! Get 50 points for logging in, plus an extra 10 points per consecutive day (up to 7-day streaks).',
            sponsorName: 'GG LOOP',
            sponsorLogo: null,
            gameId: null,
            requirementType: 'match_wins',
            requirementCount: 1,
            bonusPoints: 50,
            totalBudget: 1000000,
            pointsDistributed: 0,
            currentCompletions: 0,
            maxCompletions: null,
            startDate,
            endDate,
            isActive: true,
            createdAt: startDate,
            updatedAt: startDate,
        };
        await db.insert(challenges).values(questData);
        console.log('✅ Daily Login Quest created successfully!');
        console.log('   ID:', questData.id);
        console.log('   Title:', questData.title);
        console.log('   Bonus Points:', questData.bonusPoints);
        console.log('   Valid until:', endDate.toLocaleDateString());
        console.log('\n💡 Next steps:');
        console.log('   1. Quest is now visible in the database');
        console.log('   2. Check /api/challenges to see it in action');
        console.log('   3. Use admin tools to test quest completion');
    }
    catch (error) {
        console.error('❌ Error seeding daily login quest:', error);
        throw error;
    }
}
// Run the seed function
seedDailyLoginQuest()
    .then(() => {
    console.log('\n🎉 Seed process complete!');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
