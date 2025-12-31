import { db } from '../database';
import { challenges, sponsors } from "../../shared/schema";
import { eq, isNull, sql } from 'drizzle-orm';

/**
 * Backfill sponsors table from existing challenge sponsorName/sponsorLogo data
 * Creates unique sponsor records and links challenges to them
 */
export async function backfillSponsors(): Promise<{ created: number; linked: number }> {
  let sponsorsCreated = 0;
  let challengesLinked = 0;

  // Find all challenges with sponsorName but no sponsorId
  const challengesWithoutSponsorId = await db.select()
    .from(challenges)
    .where(isNull(challenges.sponsorId));

  // Group by unique sponsorName to avoid duplicates
  const uniqueSponsorNames = new Map<string, { name: string; logo: string | null }>();
  
  for (const challenge of challengesWithoutSponsorId) {
    if (challenge.sponsorName && !uniqueSponsorNames.has(challenge.sponsorName)) {
      uniqueSponsorNames.set(challenge.sponsorName, {
        name: challenge.sponsorName,
        logo: challenge.sponsorLogo || null,
      });
    }
  }

  console.log(`[SponsorMigration] Found ${uniqueSponsorNames.size} unique sponsors to create`);

  // Create sponsor records
  const sponsorIdMap = new Map<string, string>(); // sponsorName -> sponsorId

  for (const [sponsorName, sponsorData] of Array.from(uniqueSponsorNames.entries())) {
    // Check if sponsor already exists
    const [existingSponsor] = await db.select()
      .from(sponsors)
      .where(eq(sponsors.name, sponsorName))
      .limit(1);

    if (existingSponsor) {
      sponsorIdMap.set(sponsorName, existingSponsor.id);
      console.log(`[SponsorMigration] Sponsor "${sponsorName}" already exists`);
      continue;
    }

    // Create new sponsor
    const [newSponsor] = await db.insert(sponsors)
      .values({
        name: sponsorData.name,
        logo: sponsorData.logo,
        totalBudget: 0, // Will be calculated from challenges
        status: 'active',
        notes: 'Auto-migrated from legacy challenge data',
      })
      .returning();

    sponsorIdMap.set(sponsorName, newSponsor.id);
    sponsorsCreated++;
    console.log(`[SponsorMigration] Created sponsor "${sponsorName}"`);
  }

  // Update challenges to link to sponsors
  for (const challenge of challengesWithoutSponsorId) {
    if (!challenge.sponsorName) continue;

    const sponsorId = sponsorIdMap.get(challenge.sponsorName);
    if (!sponsorId) {
      console.warn(`[SponsorMigration] No sponsor ID found for "${challenge.sponsorName}"`);
      continue;
    }

    await db.update(challenges)
      .set({ sponsorId })
      .where(eq(challenges.id, challenge.id));

    challengesLinked++;
  }

  // Calculate initial budgets from linked challenges (for migration only)
  for (const [sponsorName, sponsorId] of Array.from(sponsorIdMap.entries())) {
    const linkedChallenges = await db.select()
      .from(challenges)
      .where(eq(challenges.sponsorId, sponsorId));

    // During migration, set totalBudget to sum of challenge budgets + 20% buffer
    const challengeBudgets = linkedChallenges.reduce((sum: number, c: any) => sum + c.totalBudget, 0);
    const totalBudget = Math.round(challengeBudgets * 1.2); // Add 20% buffer for future challenges
    const spentBudget = linkedChallenges.reduce((sum: number, c: any) => sum + c.pointsDistributed, 0);

    await db.update(sponsors)
      .set({ totalBudget, spentBudget })
      .where(eq(sponsors.id, sponsorId));
  }

  console.log(`[SponsorMigration] ✓ Created ${sponsorsCreated} sponsors, linked ${challengesLinked} challenges`);

  return { created: sponsorsCreated, linked: challengesLinked };
}

/**
 * Sync sponsor SPENT budget from their challenges
 * NOTE: Only updates spentBudget, preserves totalBudget (ledgered deposits)
 */
export async function syncSponsorBudgets(): Promise<number> {
  const allSponsors = await db.select().from(sponsors);
  let updated = 0;

  for (const sponsor of allSponsors) {
    const linkedChallenges = await db.select()
      .from(challenges)
      .where(eq(challenges.sponsorId, sponsor.id));

    // Only sync SPENT budget - totalBudget is maintained via add-budget API
    const spentBudget = linkedChallenges.reduce((sum: number, c: any) => sum + c.pointsDistributed, 0);

    if (sponsor.spentBudget !== spentBudget) {
      await db.update(sponsors)
        .set({ spentBudget })
        .where(eq(sponsors.id, sponsor.id));
      updated++;
    }
  }

  console.log(`[SponsorMigration] ✓ Synced spent budgets for ${updated} sponsors`);
  return updated;
}
