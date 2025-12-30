/**
 * DAILY CHALLENGE GENERATOR
 * Auto-creates engaging daily challenges
 * Innovation: Reactivation + engagement automation
 */
import { db } from '../server/db';
import { challenges } from '../shared/schema';
import { sql } from 'drizzle-orm';
// Daily challenge templates (rotate through these)
const CHALLENGE_TEMPLATES = [
    {
        title: "Win Streak",
        description: "Win 3 matches today",
        requirementType: "match_wins",
        requirementCount: 3,
        bonusPoints: 150
    },
    {
        title: "Grind Session",
        description: "Play for 2 hours",
        requirementType: "hours_played",
        requirementCount: 2,
        bonusPoints: 100
    },
    {
        title: "Double Down",
        description: "Win 5 matches today",
        requirementType: "match_wins",
        requirementCount: 5,
        bonusPoints: 250
    },
    {
        title: "Marathon Monday",
        description: "Play for 4 hours",
        requirementType: "hours_played",
        requirementCount: 4,
        bonusPoints: 200
    },
    {
        title: "Triple Threat",
        description: "Win 3 matches in a row",
        requirementType: "match_wins",
        requirementCount: 3,
        bonusPoints: 300
    },
    {
        title: "Weekend Warrior",
        description: "Play 10 matches this weekend",
        requirementType: "match_wins",
        requirementCount: 10,
        bonusPoints: 500
    }
];
// Time-based bonus modifiers
const TIME_BONUSES = {
    "Happy Hour (6-9pm)": { multiplier: 2, timeRange: [18, 21] },
    "Late Night (10pm-2am)": { multiplier: 1.5, timeRange: [22, 2] },
    "Early Bird (6-9am)": { multiplier: 1.75, timeRange: [6, 9] }
};
/**
 * Generate today's daily challenge
 * Run this once per day at midnight
 */
export async function generateDailyChallenge() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    // Select challenge based on day of week (for variety)
    const templateIndex = dayOfWeek % CHALLENGE_TEMPLATES.length;
    const template = CHALLENGE_TEMPLATES[templateIndex];
    // Add time bonus every other day
    let description = template.description;
    let bonusPoints = template.bonusPoints;
    if (dayOfWeek % 2 === 0) {
        const timeBonus = Object.entries(TIME_BONUSES)[dayOfWeek % 3];
        const [name, config] = timeBonus;
        description += ` during ${name}`;
        bonusPoints = Math.floor(bonusPoints * config.multiplier);
    }
    // Create challenge
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    await db.insert(challenges).values({
        title: template.title,
        description,
        requirementType: template.requirementType,
        requirementCount: template.requirementCount,
        bonusPoints,
        totalBudget: bonusPoints * 1000, // Budget for 1000 completions
        startDate: today,
        endDate,
        isActive: true
    });
    console.log(`✅ Generated daily challenge: ${template.title} (+${bonusPoints} points)`);
    return {
        title: template.title,
        description,
        bonusPoints,
        requirementCount: template.requirementCount
    };
}
/**
 * Get active challenges for user
 */
export async function getActiveChallenges() {
    const now = new Date();
    const active = await db
        .select()
        .from(challenges)
        .where(sql `
      ${challenges.isActive} = true
      AND ${challenges.startDate} <= ${now}
      AND ${challenges.endDate} >= ${now}
      AND (${challenges.maxCompletions} IS NULL OR ${challenges.currentCompletions} < ${challenges.maxCompletions})
    `)
        .orderBy(challenges.bonusPoints);
    return active;
}
/**
 * AUTO-TWEET daily challenge
 * Called after generation
 */
export function generateChallengeTweet(challenge) {
    return `🎯 TODAY'S CHALLENGE

${challenge.title}: ${challenge.description}

Bonus: +${challenge.bonusPoints} points

Active for next 24 hours!

ggloop.io

#gaming #challenge #rewards`;
}
/**
 * CRON JOB: Run daily at midnight
 * Auto-generates challenge + tweets it
 */
export async function dailyChallengeJob() {
    const challenge = await generateDailyChallenge();
    const tweet = generateChallengeTweet(challenge);
    // Save tweet to file for posting
    const fs = await import('fs');
    const dir = './daily-challenges';
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    const filename = `${dir}/${new Date().toISOString().split('T')[0]}.txt`;
    fs.writeFileSync(filename, tweet);
    console.log(`✅ Daily challenge tweet saved: ${filename}`);
    return { challenge, tweet, filename };
}
