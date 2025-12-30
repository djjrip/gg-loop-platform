// Mock environment for dry-run
process.env.ENABLE_AUTO_TWEET = 'true';
process.env.TWITTER_API_KEY = 'mock';
process.env.TWITTER_API_SECRET = 'mock';
import { startTwitterAutomation } from '../server/services/twitter';
console.log("--- STARTING TWITTER DRY RUN ---");
try {
    startTwitterAutomation();
    console.log("--- DRY RUN PASSED (No Crash) ---");
}
catch (error) {
    console.error("--- DRY RUN FAILED ---", error);
    process.exit(1);
}
