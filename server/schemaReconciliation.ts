/**
 * EMERGENCY SCHEMA RECONCILIATION
 * 
 * This migration safely adds the paypalSubscriptionId column if it doesn't exist.
 * This prevents production crashes when code expects columns that don't exist in prod DB.
 * 
 * Run this BEFORE deploying to production.
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

export async function reconcileSubscriptionSchema() {
    try {
        console.log('[SCHEMA] Checking subscription table schema...');

        // Check if paypalSubscriptionId column exists
        const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      AND column_name = 'paypal_subscription_id'
    `);

        if (result.rows.length === 0) {
            console.log('[SCHEMA] Adding missing paypal_subscription_id column...');

            await db.execute(sql`
        ALTER TABLE subscriptions 
        ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR UNIQUE
      `);

            console.log('[SCHEMA] ✅ Column added successfully');
        } else {
            console.log('[SCHEMA] ✅ Schema is up to date');
        }

        return { success: true, message: 'Schema reconciliation complete' };
    } catch (error: any) {
        console.error('[SCHEMA] ❌ Schema reconciliation failed:', error.message);

        // Don't throw - log and continue
        // The app should still work with safe defaults
        return { success: false, error: error.message };
    }
}

// Auto-run on import in production
if (process.env.NODE_ENV === 'production') {
    reconcileSubscriptionSchema().then(result => {
        if (result.success) {
            console.log('[SCHEMA] Production schema reconciliation complete');
        } else {
            console.warn('[SCHEMA] Production schema reconciliation failed, app will use safe defaults');
        }
    });
}
