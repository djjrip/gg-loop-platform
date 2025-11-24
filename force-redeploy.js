// Force Railway redeploy by creating an empty commit
const { execSync } = require('child_process');

console.log('🔄 Forcing Railway redeploy...\n');

try {
    // Create empty commit to trigger redeploy
    execSync('git commit --allow-empty -m "Force redeploy - fix OAuth login"', { stdio: 'inherit' });
    console.log('\n✅ Empty commit created');

    // Push to trigger Railway
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Pushed to GitHub - Railway will redeploy in ~2 minutes');

    console.log('\n⏳ Wait 2-3 minutes, then test login at https://ggloop.io/login');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
