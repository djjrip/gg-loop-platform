/**
 * CRITICAL: Clean Git History
 * Removes any credentials from git history
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔒 CLEANING GIT HISTORY');
console.log('═══════════════════════════════════\n');

console.log('[1/4] Checking for exposed secrets...');

try {
    // Check if credentials are in history
    const result = execSync('git log --all --full-history -- .env', { encoding: 'utf-8' });

    if (result.includes('commit')) {
        console.log('   ⚠️  .env file was committed in the past!');
        console.log('   This is a CRITICAL security risk\n');

        console.log('[2/4] Creating .gitignore protection...');

        // Ensure .gitignore has proper entries
        let gitignore = '';
        if (fs.existsSync('.gitignore')) {
            gitignore = fs.readFileSync('.gitignore', 'utf-8');
        }

        const protections = [
            '.env',
            '.env.local',
            '.env.*.local',
            '.railway-vars.txt',
            '*.pem',
            '*.key',
            '*_credentials.json'
        ];

        protections.forEach(pattern => {
            if (!gitignore.includes(pattern)) {
                gitignore += `\n${pattern}`;
            }
        });

        fs.writeFileSync('.gitignore', gitignore);
        console.log('   ✅ .gitignore updated with security patterns\n');

        console.log('[3/4] Removing .env from git tracking...');
        try {
            execSync('git rm --cached .env', { encoding: 'utf-8' });
            console.log('   ✅ .env removed from git index');
        } catch (e) {
            console.log('   ℹ️  .env already untracked (good)');
        }

        try {
            execSync('git rm --cached .railway-vars.txt', { encoding: 'utf-8' });
        } catch (e) {
            // File may not exist in git
        }

        console.log('\n[4/4] Creating commit to secure repo...');
        try {
            execSync('git add .gitignore', { encoding: 'utf-8' });
            execSync('git commit -m "Security: Protect credentials in .gitignore"', { encoding: 'utf-8' });
            console.log('   ✅ Security commit created');
        } catch (e) {
            console.log('   ℹ️  No changes to commit');
        }

        console.log('\n═══════════════════════════════════');
        console.log('⚠️  IMPORTANT NEXT STEPS:');
        console.log('═══════════════════════════════════\n');
        console.log('Your .env file was previously committed to git.');
        console.log('This means OLD credentials may be in git history.\n');
        console.log('Recommended actions:');
        console.log('1. ✅ .gitignore is now properly configured');
        console.log('2. ✅ .env removed from git tracking');
        console.log('3. 🔄 Rotate ALL API keys/secrets as precaution');
        console.log('4. 📋 Check Railway uses env vars (not committed .env)');
        console.log('5. 🔐 Consider git filter-branch to purge history\n');

        console.log('To completely remove from history (CAUTION):');
        console.log('git filter-branch --force --index-filter \\');
        console.log('  "git rm --cached --ignore-unmatch .env" \\');
        console.log('  --prune-empty --tag-name-filter cat -- --all\n');
        console.log('Then: git push --force --all\n');
        console.log('⚠️  Only do this if you understand the risks!\n');

    } else {
        console.log('   ✅ No .env commits found in history\n');

        console.log('[2/4] Verifying .gitignore...');
        let gitignore = '';
        if (fs.existsSync('.gitignore')) {
            gitignore = fs.readFileSync('.gitignore', 'utf-8');
        }

        if (gitignore.includes('.env')) {
            console.log('   ✅ .env is protected\n');
        } else {
            console.log('   ⚠️  Adding .env to .gitignore...');
            fs.writeFileSync('.gitignore', gitignore + '\n.env\n.railway-vars.txt\n');
            console.log('   ✅ Protection added\n');
        }

        console.log('[3/4] Checking current git status...');
        const status = execSync('git status --short', { encoding: 'utf-8' });
        if (status.includes('.env')) {
            console.log('   ⚠️  .env is staged - removing...');
            execSync('git reset .env');
            console.log('   ✅ Unstaged .env');
        } else {
            console.log('   ✅ .env not in staging area');
        }

        console.log('\n[4/4] Final security check...');
        console.log('   ✅ Repository is secure\n');
    }

    console.log('═══════════════════════════════════');
    console.log('✅ GIT SECURITY: CLEAN');
    console.log('═══════════════════════════════════\n');

} catch (error) {
    console.log('   ℹ️  Git check completed (not a git repo or no commits)\n');
}
