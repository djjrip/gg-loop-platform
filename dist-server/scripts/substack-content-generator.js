#!/usr/bin/env node
/**
 * GG LOOP SUBSTACK CONTENT GENERATOR
 *
 * CLI tool to generate Substack posts from templates
 * Ensures brand voice consistency and FTC compliance
 *
 * Usage: node scripts/substack-content-generator.js
 */
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Promisify readline question
const question = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};
// Content series options
const SERIES = {
    '1': {
        name: 'Building GG Loop',
        template: 'building_gg_loop_template.md',
        audience: 'Developers, entrepreneurs, technical founders',
        cadence: 'Weekly (Tuesdays)'
    },
    '2': {
        name: 'The Gaming Grind',
        template: 'gaming_grind_template.md',
        audience: 'Gamers (Valorant, CS2, LoL, OW2 players)',
        cadence: 'Weekly (Thursdays)'
    },
    '3': {
        name: 'Broke But Optimizing',
        template: 'broke_but_optimizing_template.md',
        audience: 'Filipino-American community, budget-conscious millennials/Gen Z',
        cadence: 'Monthly (Saturdays)'
    },
    '4': {
        name: 'The Business of Gaming',
        template: 'business_of_gaming_template.md',
        audience: 'Investors, brand partners, gaming industry professionals',
        cadence: 'Monthly (Mondays)'
    }
};
// Affiliate disclosure template
const AFFILIATE_DISCLOSURE = `**Affiliate Disclosure:** This post contains affiliate links. If you make a purchase through these links, I may earn a commission at no extra cost to you. I only recommend products I genuinely use and believe in.`;
// Footer template
const FOOTER_TEMPLATE = (series) => `
---

**Join the GG Loop Community:**
- Discord: [discord.gg/X6GXg2At2D](https://discord.gg/X6GXg2At2D)
- Platform: [ggloop.io](https://ggloop.io)
- Twitter: [@ggloop](https://twitter.com/ggloop)

**Subscribe for ${series === 'Building GG Loop' ? 'weekly dev logs' : series === 'The Gaming Grind' ? 'weekly gaming tips' : series === 'Broke But Optimizing' ? 'monthly optimization tips' : 'monthly business insights'}** 👇
`;
async function main() {
    console.log('\n🎮 GG LOOP SUBSTACK CONTENT GENERATOR\n');
    console.log('This tool helps you create Substack posts with consistent brand voice and FTC compliance.\n');
    // Select series
    console.log('Select a content series:');
    Object.entries(SERIES).forEach(([key, series]) => {
        console.log(`${key}. ${series.name} (${series.cadence})`);
    });
    const seriesChoice = await question('\nEnter series number (1-4): ');
    const selectedSeries = SERIES[seriesChoice];
    if (!selectedSeries) {
        console.log('Invalid series selection. Exiting.');
        rl.close();
        return;
    }
    console.log(`\n✅ Selected: ${selectedSeries.name}`);
    console.log(`Target Audience: ${selectedSeries.audience}\n`);
    // Get post details
    const title = await question('Post title: ');
    const hasAffiliateLinks = await question('Does this post contain affiliate links? (y/n): ');
    const readingTime = await question('Estimated reading time (minutes): ');
    // Generate post metadata
    const metadata = `# ${title}

**Series:** ${selectedSeries.name}  
**Published:** [Date]  
**Reading Time:** ${readingTime} minutes

---

${hasAffiliateLinks.toLowerCase() === 'y' ? AFFILIATE_DISCLOSURE + '\n\n---\n' : ''}`;
    // Get content sections
    console.log('\n📝 Now let\'s build the content. Press Enter after each section.\n');
    const hook = await question('Opening hook (2-3 sentences): ');
    const problem = await question('\nThe Problem (what challenge/struggle): ');
    const solution = await question('\nThe Solution (what you did/built/learned): ');
    const results = await question('\nThe Results (metrics, outcomes, lessons): ');
    const cta = await question('\nCall-to-Action (what should readers do): ');
    // Generate full post
    const fullPost = `${metadata}
${hook}

---

## The Problem

${problem}

---

## The Solution

${solution}

---

## The Results

${results}

---

## Your Turn

${cta}

${FOOTER_TEMPLATE(selectedSeries.name)}

**Next post:** [Topic]
`;
    // Save post
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '.md';
    const outputPath = path.join(process.cwd(), 'substack_posts', filename);
    fs.writeFileSync(outputPath, fullPost, 'utf-8');
    console.log(`\n✅ Post generated successfully!`);
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Review and edit the post`);
    console.log(`2. Add images/screenshots if needed`);
    console.log(`3. Run through compliance checklist (see SUBSTACK_LEGAL_COMPLIANCE.md)`);
    console.log(`4. Publish on Substack`);
    console.log(`5. Cross-promote on Discord, Twitter, TikTok\n`);
    // Content calendar tracking
    const today = new Date().toISOString().split('T')[0];
    const calendarEntry = `${today} | ${selectedSeries.name} | ${title}\n`;
    const calendarPath = path.join(process.cwd(), 'substack_content_calendar.txt');
    fs.appendFileSync(calendarPath, calendarEntry, 'utf-8');
    console.log(`📅 Added to content calendar: ${calendarPath}\n`);
    rl.close();
}
main().catch((error) => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});
