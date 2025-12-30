/**
 * TWITCH EMAIL SCRAPER
 * Automatically finds business emails from Twitch streamer profiles
 * Scrapes public information only - 100% legal
 */
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
// Email regex pattern
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
/**
 * Scrape Twitch profile for business email
 */
export async function findTwitchEmail(username) {
    console.log(`\n🔍 Searching for email: ${username}`);
    const result = {
        username,
        emails: [],
        sources: [],
        profileUrl: `https://www.twitch.tv/${username}`,
    };
    try {
        // Method 1: Scrape About page
        const aboutUrl = `https://www.twitch.tv/${username}/about`;
        console.log(`  📄 Checking: ${aboutUrl}`);
        const response = await fetch(aboutUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        // Look for emails in about section
        const aboutText = $('[data-a-target="about-panel"]').text();
        const emailsInAbout = aboutText.match(EMAIL_REGEX) || [];
        emailsInAbout.forEach(email => {
            if (!result.emails.includes(email)) {
                result.emails.push(email);
                result.sources.push('About section');
            }
        });
        // Look for emails in panels
        const panels = $('[data-a-target="panel-content"]');
        panels.each((_, panel) => {
            const panelText = $(panel).text();
            const emailsInPanel = panelText.match(EMAIL_REGEX) || [];
            emailsInPanel.forEach(email => {
                if (!result.emails.includes(email)) {
                    result.emails.push(email);
                    result.sources.push('Panel');
                }
            });
        });
        // Method 2: Check for common business email patterns
        if (result.emails.length === 0) {
            console.log(`  🔍 No email found, trying common patterns...`);
            // These are just guesses, would need verification
            const commonPatterns = [
                `business@${username}.com`,
                `${username}@gmail.com`,
                `contact@${username}.com`,
            ];
            console.log(`  ℹ️  Suggested emails to verify manually:`);
            commonPatterns.forEach(pattern => console.log(`    - ${pattern}`));
        }
        if (result.emails.length > 0) {
            console.log(`  ✅ Found ${result.emails.length} email(s):`);
            result.emails.forEach((email, i) => {
                console.log(`    ${i + 1}. ${email} (${result.sources[i]})`);
            });
        }
        else {
            console.log(`  ❌ No public email found`);
        }
    }
    catch (error) {
        console.log(`  ⚠️  Error scraping: ${error}`);
    }
    return result;
}
/**
 * Batch process multiple streamers
 */
export async function findMultipleEmails(usernames) {
    console.log(`\n📧 Processing ${usernames.length} streamers...\n`);
    console.log('═'.repeat(50));
    const results = [];
    for (const username of usernames) {
        const result = await findTwitchEmail(username);
        results.push(result);
        // Rate limit: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('\n═'.repeat(50));
    console.log('\n📊 SUMMARY:\n');
    const withEmails = results.filter(r => r.emails.length > 0);
    const withoutEmails = results.filter(r => r.emails.length === 0);
    console.log(`Total streamers: ${results.length}`);
    console.log(`Found emails: ${withEmails.length} (${Math.round(withEmails.length / results.length * 100)}%)`);
    console.log(`No emails: ${withoutEmails.length}`);
    if (withEmails.length > 0) {
        console.log(`\n✅ Streamers with emails:`);
        withEmails.forEach(r => {
            console.log(`  ${r.username}: ${r.emails.join(', ')}`);
        });
    }
    if (withoutEmails.length > 0) {
        console.log(`\n❌ Streamers without public emails:`);
        withoutEmails.forEach(r => {
            console.log(`  ${r.username} (try Hunter.io or manual verification)`);
        });
    }
    return results;
}
/**
 * Export results to CSV
 */
export function exportToCSV(results) {
    let csv = 'Username,Email,Source,Profile URL\n';
    results.forEach(result => {
        if (result.emails.length > 0) {
            result.emails.forEach((email, i) => {
                csv += `${result.username},${email},${result.sources[i]},${result.profileUrl}\n`;
            });
        }
        else {
            csv += `${result.username},NO EMAIL FOUND,,${result.profileUrl}\n`;
        }
    });
    return csv;
}
// ============================================
// EXAMPLE USAGE
// ============================================
const EXAMPLE_STREAMERS = [
    'doublelift',
    'pokimane',
    'shroud',
    // Add more Riot game streamers here
];
async function runEmailScraper() {
    console.log('═'.repeat(50));
    console.log('  TWITCH EMAIL SCRAPER');
    console.log('═'.repeat(50));
    console.log('\nHow to use:');
    console.log('1. Find streamers on TwitchTracker (100-1K viewers)');
    console.log('2. Add usernames to EXAMPLE_STREAMERS array');
    console.log('3. Run: npx tsx server/twitchEmailScraper.ts\n');
    console.log('The scraper will:');
    console.log('- Check their About page');
    console.log('- Check their panels');
    console.log('- Extract any public emails');
    console.log('- Export to CSV file\n');
    // Uncomment to run on example streamers
    // const results = await findMultipleEmails(EXAMPLE_STREAMERS);
    // const csv = exportToCSV(results);
    // console.log('\n📄 CSV Output:\n');
    // console.log(csv);
    console.log('\n✅ Scraper ready!');
    console.log('Edit EXAMPLE_STREAMERS array and uncomment lines 144-147 to run\n');
}
runEmailScraper();
