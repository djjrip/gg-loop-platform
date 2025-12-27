/**
 * 🎁 AUTOMATED REWARD FULFILLMENT
 * 
 * Automatically fulfills rewards using affiliate links when available
 * Falls back to manual fulfillment if no affiliate link
 * 
 * What it does:
 * - Checks for pending redemptions
 * - Uses affiliate links if available
 * - Tracks commissions automatically
 * - Sends fulfillment emails
 * - Updates redemption status
 */

import { db } from '../db';
import { rewardClaims, rewardTypes, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail } from '../services/email';

interface FulfillmentResult {
  fulfilled: number;
  skipped: number;
  errors: number;
  totalCommissions: number;
}

/**
 * Automatically fulfill rewards with affiliate links
 */
export async function autoFulfillRewards(): Promise<FulfillmentResult> {
  const result: FulfillmentResult = {
    fulfilled: 0,
    skipped: 0,
    errors: 0,
    totalCommissions: 0
  };

  console.log('🎁 Starting automated reward fulfillment...\n');

  // Get all pending redemptions that are approved
  const pendingClaims = await db
    .select()
    .from(rewardClaims)
    .where(and(
      eq(rewardClaims.status, 'in_progress'), // Already approved, ready to fulfill
      eq(rewardClaims.fulfilledAt, null as any) // Not yet fulfilled
    ))
    .limit(10); // Process 10 at a time to avoid overload

  for (const claim of pendingClaims) {
    try {
      // Get reward type details
      const [rewardType] = await db
        .select()
        .from(rewardTypes)
        .where(eq(rewardTypes.id, claim.rewardTypeId))
        .limit(1);

      if (!rewardType) {
        console.error(`❌ Reward type not found for claim ${claim.id}`);
        result.errors++;
        continue;
      }

      // Check if reward has affiliate link
      if (rewardType.affiliateUrl) {
        // Use affiliate link for fulfillment
        const commission = rewardType.affiliateCommission || 0;
        
        // Update claim with affiliate info
        await db
          .update(rewardClaims)
          .set({
            status: 'fulfilled',
            fulfilledAt: new Date(),
            fulfillmentMethod: 'affiliate',
            fulfillmentData: {
              affiliateUrl: rewardType.affiliateUrl,
              affiliateProgram: rewardType.affiliateProgram,
              commission: commission
            },
            updatedAt: new Date()
          })
          .where(eq(rewardClaims.id, claim.id));

        // Send fulfillment email
        if (claim.userEmail) {
          await sendEmail({
            to: claim.userEmail,
            subject: 'Your GG LOOP Reward is Ready!',
            htmlBody: `
              <h2>🎁 Your Reward is Ready!</h2>
              <p>Hi ${claim.userDisplayName || 'there'},</p>
              <p>Your redemption for <strong>${rewardType.name}</strong> has been fulfilled!</p>
              <p>You can access your reward using the link below:</p>
              <p><a href="${rewardType.affiliateUrl}" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Claim Your Reward</a></p>
              <p>Thanks for gaming with GG LOOP!</p>
            `
          }).catch(err => console.error('Failed to send fulfillment email:', err));
        }

        result.fulfilled++;
        result.totalCommissions += commission;
        console.log(`✅ Fulfilled ${rewardType.name} via affiliate (commission: $${(commission / 100).toFixed(2)})`);
      } else {
        // No affiliate link - mark for manual fulfillment
        result.skipped++;
        console.log(`⚠️  No affiliate link for ${rewardType.name} - requires manual fulfillment`);
      }
    } catch (error: any) {
      console.error(`❌ Error fulfilling claim ${claim.id}:`, error.message);
      result.errors++;
    }
  }

  console.log(`\n📊 Fulfillment Summary:`);
  console.log(`   ✅ Fulfilled: ${result.fulfilled}`);
  console.log(`   ⏸️  Skipped (manual): ${result.skipped}`);
  console.log(`   ❌ Errors: ${result.errors}`);
  console.log(`   💰 Total Commissions: $${(result.totalCommissions / 100).toFixed(2)}\n`);

  return result;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  autoFulfillRewards()
    .then(result => {
      console.log('✅ Automated fulfillment complete');
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('❌ Automated fulfillment failed:', err);
      process.exit(1);
    });
}

