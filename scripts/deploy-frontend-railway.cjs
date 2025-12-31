#!/usr/bin/env node

/**
 * Automated Railway Frontend Deployment Script
 * Deploys the GG LOOP frontend to Railway via API
 */

const { execSync } = require('child_process');

console.log('🚀 Starting automated Railway frontend deployment...\n');

// Step 1: Verify Railway CLI is authenticated
console.log('Step 1: Verifying Railway authentication...');
try {
    const whoami = execSync('railway whoami', { encoding: 'utf-8' });
    console.log(`✅ ${whoami.trim()}\n`);
} catch (error) {
    console.error('❌ Not logged in to Railway. Run: railway login');
    process.exit(1);
}

// Step 2: Link to project (if not already linked)
console.log('Step 2: Linking to Railway project...');
try {
    execSync('railway link', { stdio: 'inherit' });
    console.log('✅ Project linked\n');
} catch (error) {
    console.log('⚠️  Already linked or manual selection needed\n');
}

// Step 3: Create new service for frontend
console.log('Step 3: Creating frontend service...');
try {
    execSync('railway service create gg-loop-frontend', { stdio: 'inherit' });
    console.log('✅ Frontend service created\n');
} catch (error) {
    console.log('⚠️  Service might already exist\n');
}

// Step 4: Set environment variables
console.log('Step 4: Setting environment variables...');
const envVars = [
    'VITE_API_BASE_URL=https://reward-fulfillment-production.up.railway.app',
    'NODE_ENV=production'
];

for (const envVar of envVars) {
    try {
        execSync(`railway variables set ${envVar}`, { stdio: 'inherit' });
        console.log(`✅ Set: ${envVar.split('=')[0]}`);
    } catch (error) {
        console.error(`❌ Failed to set: ${envVar}`);
    }
}
console.log('');

// Step 5: Deploy
console.log('Step 5: Deploying to Railway...');
try {
    execSync('railway up --detach', { stdio: 'inherit' });
    console.log('✅ Deployment triggered\n');
} catch (error) {
    console.error('❌ Deployment failed');
    process.exit(1);
}

// Step 6: Get deployment URL
console.log('Step 6: Getting deployment URL...');
try {
    const domain = execSync('railway domain', { encoding: 'utf-8' });
    console.log(`\n🎉 Frontend deployed successfully!`);
    console.log(`\n📍 Railway URL: ${domain.trim()}`);
    console.log(`\n⚠️  NEXT STEP: Update DNS to point ggloop.io to this URL\n`);
} catch (error) {
    console.log('\n⚠️  Could not retrieve domain. Check Railway dashboard.\n');
}

console.log('✅ Automated deployment complete!');
