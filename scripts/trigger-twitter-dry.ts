
// Script to trigger Twitter Automation in DRY RUN mode
process.env.ENABLE_AUTO_TWEET = 'true'; // Force enable for test
import { executeTwitterJob } from "../server/services/twitter";

console.log("--- TRIGGERING TWITTER DRY RUN ---");
executeTwitterJob(true) // dryRun = true
    .then(() => console.log("--- DRY RUN COMPLETE ---"))
    .catch(err => console.error("--- DRY RUN FAILED ---", err));
