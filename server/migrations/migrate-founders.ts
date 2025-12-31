/**
 * Retroactive Founder Assignment Migration Script
 * 
 * This script assigns founder status to the first 100 users who registered
 * before the founder bonus system was implemented.
 * 
 * Run this script ONCE after deploying the founder system.
 * 
 * Usage: npm run migrate:founders
 */

import { db } from "../database";
import { users } from "../../shared/schema";
import { assignFounderStatus, getFounderStats } from "../founderService";
import { asc } from "drizzle-orm";

async function migrateFounders() {
    console.log("[Migration] Starting retroactive founder assignment...\n");

    //  Get current founder stats
    const stats = await getFounderStats();
    console.log(`Current founder count: ${stats.totalFounders}/${stats.maxFounders}`);
    console.log(`Remaining slots: ${stats.remainingSlots}\n`);

    if (stats.remainingSlots === 0) {
        console.log("✅ All founder slots already filled. No migration needed.");
        return;
    }

    // Get the first N users (ordered by creation date) who aren't already founders
    const slotsToFill = stats.remainingSlots;
    console.log(`Looking for ${slotsToFill} users to assign founder status...\n`);

    const eligibleUsers = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            createdAt: users.createdAt,
            isFounder: users.isFounder,
        })
        .from(users)
        .orderBy(asc(users.createdAt))
        .limit(100); // Get first 100 users ever created

    console.log(`Found ${eligibleUsers.length} total early users\n`);

    // Filter out anyone who's already a founder
    const usersToAssign = eligibleUsers.filter(u => !u.isFounder).slice(0, slotsToFill);

    if (usersToAssign.length === 0) {
        console.log("✅ No eligible users found. Migration complete.");
        return;
    }

    console.log(`Assigning founder status to ${usersToAssign.length} users:\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToAssign) {
        try {
            const result = await assignFounderStatus(user.id, user.email || "migrated-user");

            if (result.success) {
                console.log(`✅ #${result.founderNumber} - ${user.email || user.username || user.id} (Created: ${user.createdAt?.toISOString().split('T')[0]})`);
                successCount++;
            } else {
                console.log(`❌ Failed: ${user.email || user.id} - ${result.message}`);
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ Error assigning founder to ${user.email || user.id}:`, error);
            errorCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n[Migration] Complete!`);
    console.log(`✅ Successfully assigned: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Show updated stats
    const finalStats = await getFounderStats();
    console.log(`\nFinal founder count: ${finalStats.totalFounders}/${finalStats.maxFounders}`);
    console.log(`Remaining slots: ${finalStats.remainingSlots}`);
}

// Run the migration
migrateFounders()
    .then(() => {
        console.log("\n✅ Migration finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    });
