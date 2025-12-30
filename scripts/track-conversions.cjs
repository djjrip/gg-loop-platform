#!/usr/bin/env node
/**
 * CONVERSION FUNNEL TRACKER
 * Monitors user journey from signup to paying customer
 * Run: node scripts/track-conversions.cjs
 */

require('dotenv/config');

class ConversionFunnel {
    constructor() {
        this.stages = {
            website_visit: { name: 'Website Visit', count: 0 },
            signup: { name: 'Account Created', count: 0 },
            desktop_download: { name: 'Desktop App Downloaded', count: 0 },
            first_session: { name: 'First Gaming/Coding Session', count: 0 },
            builder_tier_view: { name: 'Viewed Builder Tier', count: 0 },
            builder_tier_purchase: { name: 'Builder Tier Purchased', count: 0 }
        };

        this.conversionRates = {};
    }

    logStage(stage, userId, metadata = {}) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${stage}: User ${userId}`, metadata);

        if (this.stages[stage]) {
            this.stages[stage].count++;
        }

        // In production, write to database
        return {
            stage,
            userId,
            timestamp,
            metadata
        };
    }

    calculateConversions() {
        const total = this.stages.website_visit.count || 1;

        console.log('\n📊 CONVERSION FUNNEL ANALYSIS\n');

        Object.keys(this.stages).forEach(key => {
            const stage = this.stages[key];
            const rate = ((stage.count / total) * 100).toFixed(2);
            this.conversionRates[key] = rate;

            console.log(`${stage.name}: ${stage.count} (${rate}%)`);
        });

        console.log('\n🎯 KEY METRICS:\n');

        const signupRate = this.conversionRates.signup;
        const downloadRate = ((this.stages.desktop_download.count / (this.stages.signup.count || 1)) * 100).toFixed(2);
        const activationRate = ((this.stages.first_session.count / (this.stages.desktop_download.count || 1)) * 100).toFixed(2);
        const builderRate = ((this.stages.builder_tier_purchase.count / (this.stages.first_session.count || 1)) * 100).toFixed(2);

        console.log(`Signup Rate: ${signupRate}%`);
        console.log(`Download Rate: ${downloadRate}%`);
        console.log(`Activation Rate: ${activationRate}%`);
        console.log(`Builder Conversion: ${builderRate}%\n`);

        // Revenue calculation
        const builderTierPrice = 12;
        const mrr = this.stages.builder_tier_purchase.count * builderTierPrice;

        console.log(`💰 REVENUE:\n`);
        console.log(`Builder Tier Customers: ${this.stages.builder_tier_purchase.count}`);
        console.log(`MRR: $${mrr}`);
        console.log(`ARR (Projected): $${mrr * 12}\n`);

        return {
            stages: this.stages,
            rates: this.conversionRates,
            mrr,
            arr: mrr * 12
        };
    }

    identifyDropoffs() {
        console.log('⚠️  DROPOFF POINTS:\n');

        const signupToDownload = this.stages.signup.count - this.stages.desktop_download.count;
        const downloadToActivation = this.stages.desktop_download.count - this.stages.first_session.count;
        const activationToBuilder = this.stages.first_session.count - this.stages.builder_tier_purchase.count;

        console.log(`Signup → Download: ${signupToDownload} users lost`);
        console.log(`Download → First Session: ${downloadToActivation} users lost`);
        console.log(`Active → Builder Tier: ${activationToBuilder} users lost\n`);

        console.log('💡 OPTIMIZATION OPPORTUNITIES:\n');

        if (signupToDownload > 0) {
            console.log('1. Improve desktop app download flow');
            console.log('   - Add download button to dashboard');
            console.log('   - Send email reminder after signup');
        }

        if (downloadToActivation > 0) {
            console.log('2. Increase activation rate');
            console.log('   - Better onboarding in desktop app');
            console.log('   - Show XP progress immediately');
        }

        if (activationToBuilder > 0) {
            console.log('3. Improve Builder Tier conversion');
            console.log('   - Show XP differential (10 vs 20)');
            console.log('   - Offer trial or discount');
        }

        console.log('');
    }

    getRecommendations() {
        const funnel = this.calculateConversions();
        this.identifyDropoffs();

        console.log('🚀 IMMEDIATE ACTIONS:\n');

        if (this.stages.website_visit.count === 0) {
            console.log('1. Drive traffic to website (SEO, content, Reddit)');
        }

        if (this.stages.signup.count < 10) {
            console.log('2. Focus on signups (simplify form, add social proof)');
        }

        if (this.stages.builder_tier_purchase.count === 0) {
            console.log('3. Get first paying customer (offer early bird discount)');
        }

        console.log('');

        return funnel;
    }
}

// Simulate current funnel based on Day 1 data
const funnel = new ConversionFunnel();

// Day 1 baseline (all zeros, but setting up tracking)
funnel.logStage('website_visit', 'visitor1');
funnel.getRecommendations();

module.exports = { ConversionFunnel };
