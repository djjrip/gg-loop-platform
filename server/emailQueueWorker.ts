/**
 * Email Queue Processor
 * Runs periodically to send scheduled welcome emails
 * 
 * Usage: node server/emailQueueWorker.js
 * Or: Add to Railway as cron job
 */

import { db } from './db';
import { users } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { sendEmail } from './services/email';
import { WELCOME_SEQUENCE, getNextEmail, renderEmail } from './lib/emailSequence';

async function processEmailQueue() {
    console.log('📧 Processing email queue...');

    try {
        // Get users who haven't completed the sequence
        // emailsSent is a counter field (you'd add this to schema)
        const pendingUsers = await db
            .select()
            .from(users)
            .where(sql`emails_sent < ${WELCOME_SEQUENCE.length}`)
            .limit(100); // Process in batches

        let sent = 0;

        for (const user of pendingUsers) {
            const nextEmail = getNextEmail(
                new Date(user.createdAt),
                user.emailsSent || 0
            );

            if (nextEmail && user.email) {
                const rendered = renderEmail(nextEmail, {
                    firstName: user.firstName || 'Gamer',
                    totalPoints: user.totalPoints,
                    referralCode: user.referralCode || '',
                });

                try {
                    await sendEmail({
                        to: user.email,
                        subject: rendered.subject,
                        html: rendered.body.replace(/\n/g, '<br>'),
                    });

                    // Update counter
                    await db
                        .update(users)
                        .set({ emailsSent: (user.emailsSent || 0) + 1 })
                        .where(sql`id = ${user.id}`);

                    sent++;
                    console.log(`   ✅ Sent to ${user.email}`);
                } catch (error) {
                    console.error(`   ❌ Failed for ${user.email}:`, error);
                }

                // Rate limit: wait 100ms between sends
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`\n✅ Sent ${sent} emails from queue`);

    } catch (error) {
        console.error('❌ Error processing email queue:', error);
    }
}

// Run if called directly
if (require.main === module) {
    processEmailQueue()
        .then(() => {
            console.log('Queue processed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { processEmailQueue };
