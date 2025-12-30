// Scripts/run-twitter-job.ts
// USAGE: npx tsx scripts/run-twitter-job.ts
// PURPOSE: Run the Twitter automation logic once immediately.
// Useful for Railway Cron Jobs or Manual Triggers.
// SHARED LOGIC: Uses executeTwitterJob from 'server/services/twitter' to ensure CAP and LOGS are respected.
import { executeTwitterJob } from '../server/services/twitter';
async function runDirectly() {
    console.log("--- STARTING TWITTER JOB (MANUAL/CRON) ---");
    if (process.env.ENABLE_AUTO_TWEET !== 'true') {
        console.log("ENABLE_AUTO_TWEET is not true. Exiting safely.");
        process.exit(0);
    }
    try {
        await executeTwitterJob();
        console.log("--- JOB COMPLETE ---");
        process.exit(0);
    }
    catch (error) {
        console.error("Critical Job Error:", error);
        process.exit(1);
    }
}
runDirectly();
