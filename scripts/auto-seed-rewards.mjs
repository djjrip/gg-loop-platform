#!/usr/bin/env node
/**
 * AUTOMATED REWARD SEEDING
 * Seeds rewards to production with zero manual input
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

async function seedRewards() {
    log('\n🎁 AUTOMATED REWARD SEEDING', 'cyan');
    log('='.repeat(60), 'cyan');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        log('\n❌ DATABASE_URL not set', 'red');
        log('Set it with: $env:DATABASE_URL="postgresql://..."', 'yellow');
        log('Get it from: railway.app → PostgreSQL → Variables', 'yellow');
        process.exit(1);
    }

    log('\n✅ DATABASE_URL found', 'green');
    log(`📍 Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}`, 'cyan');

    // Run seed script
    log('\n🌱 Seeding rewards...', 'yellow');

    try {
        const output = execSync('npm run seed:rewards', {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        if (output.includes('✅') || output.includes('success')) {
            log('\n✅ REWARDS SEEDED SUCCESSFULLY!', 'green');
            log('🛍️  Shop is now live with 12 rewards', 'green');
            log('🌐 Visit: https://ggloop.io/shop', 'cyan');
            return true;
        } else {
            log('\n⚠️  Seeding completed but status unclear', 'yellow');
            log('Check manually: https://ggloop.io/shop', 'yellow');
            return false;
        }
    } catch (error) {
        log('\n❌ SEEDING FAILED', 'red');
        log(`Error: ${error.message}`, 'red');
        return false;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedRewards()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            log(`\n❌ Fatal error: ${error.message}`, 'red');
            process.exit(1);
        });
}

export { seedRewards };
