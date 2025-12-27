/**
 * 🌐 BROWSER AUTOMATION FOR AFFILIATE SETUP
 * 
 * Automates browser tasks like affiliate program signups
 * PRIVACY-SAFE: Uses environment variables for sensitive data
 * AUTHENTIC: Only uses real business data, no fake numbers
 * 
 * What it automates:
 * - Amazon Associates signup
 * - G2A Goldmine signup
 * - Other affiliate program registrations
 * - Form filling with your real business info
 */

import puppeteer, { Browser, Page } from 'puppeteer';

interface AffiliateConfig {
  businessName: string;
  businessEmail: string;
  website: string;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

/**
 * Get affiliate configuration from environment variables
 * PRIVACY-SAFE: Never hardcodes sensitive data
 */
function getAffiliateConfig(): AffiliateConfig {
  const config: AffiliateConfig = {
    businessName: process.env.BUSINESS_NAME || 'GG LOOP LLC',
    businessEmail: process.env.BUSINESS_EMAIL || '',
    website: process.env.BASE_URL || 'https://ggloop.io',
    taxId: process.env.BUSINESS_TAX_ID,
    address: process.env.BUSINESS_ADDRESS ? JSON.parse(process.env.BUSINESS_ADDRESS) : undefined,
  };

  // Validate required fields
  if (!config.businessEmail) {
    throw new Error('BUSINESS_EMAIL environment variable is required');
  }

  return config;
}

/**
 * Automate Amazon Associates signup
 * Returns: Application URL or status
 */
export async function automateAmazonAssociatesSignup(): Promise<{ success: boolean; message: string; url?: string }> {
  const config = getAffiliateConfig();
  let browser: Browser | null = null;

  try {
    console.log('🤖 Starting Amazon Associates signup automation...');
    console.log('📧 Using business email:', config.businessEmail);
    console.log('🌐 Website:', config.website);

    browser = await puppeteer.launch({
      headless: false, // Show browser so you can verify
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    // Navigate to Amazon Associates
    await page.goto('https://affiliate-program.amazon.com/', { waitUntil: 'networkidle2' });

    // Wait for sign up button and click
    await page.waitForSelector('a[href*="signup"]', { timeout: 10000 });
    await page.click('a[href*="signup"]');

    // Fill in business information
    await page.waitForSelector('input[name*="email"], input[type="email"]', { timeout: 10000 });
    
    // Fill email
    await page.type('input[name*="email"], input[type="email"]', config.businessEmail, { delay: 100 });

    // Fill website URL
    const websiteInput = await page.$('input[name*="website"], input[name*="url"], input[placeholder*="website" i]');
    if (websiteInput) {
      await websiteInput.type(config.website, { delay: 100 });
    }

    // Fill business name if field exists
    const businessNameInput = await page.$('input[name*="name"], input[name*="business"]');
    if (businessNameInput) {
      await businessNameInput.type(config.businessName, { delay: 100 });
    }

    console.log('✅ Form filled. Please review and complete CAPTCHA manually if needed.');
    console.log('⏸️  Pausing for manual review (30 seconds)...');

    // Wait for manual review
    await page.waitForTimeout(30000);

    // Check if we're on a success page
    const currentUrl = page.url();
    const success = currentUrl.includes('success') || currentUrl.includes('dashboard') || currentUrl.includes('approved');

    if (success) {
      return {
        success: true,
        message: 'Amazon Associates signup appears successful',
        url: currentUrl,
      };
    }

    return {
      success: false,
      message: 'Please complete the signup manually. Form has been pre-filled.',
      url: currentUrl,
    };

  } catch (error: any) {
    console.error('❌ Amazon Associates automation error:', error.message);
    return {
      success: false,
      message: `Error: ${error.message}. Please complete signup manually.`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Automate G2A Goldmine signup
 */
export async function automateG2AGoldmineSignup(): Promise<{ success: boolean; message: string; url?: string }> {
  const config = getAffiliateConfig();
  let browser: Browser | null = null;

  try {
    console.log('🤖 Starting G2A Goldmine signup automation...');
    console.log('📧 Using business email:', config.businessEmail);

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    // Navigate to G2A Goldmine
    await page.goto('https://www.g2a.com/goldmine', { waitUntil: 'networkidle2' });

    // Look for signup/register button
    await page.waitForSelector('a[href*="register"], a[href*="signup"], button[class*="register"]', { timeout: 10000 });
    await page.click('a[href*="register"], a[href*="signup"], button[class*="register"]');

    // Wait for form
    await page.waitForSelector('input[type="email"], input[name*="email"]', { timeout: 10000 });

    // Fill email
    await page.type('input[type="email"], input[name*="email"]', config.businessEmail, { delay: 100 });

    // Fill website if field exists
    const websiteInput = await page.$('input[name*="website"], input[name*="url"]');
    if (websiteInput) {
      await websiteInput.type(config.website, { delay: 100 });
    }

    console.log('✅ Form filled. Please review and complete manually if needed.');
    console.log('⏸️  Pausing for manual review (30 seconds)...');

    await page.waitForTimeout(30000);

    const currentUrl = page.url();
    const success = currentUrl.includes('dashboard') || currentUrl.includes('success') || currentUrl.includes('approved');

    return {
      success,
      message: success ? 'G2A Goldmine signup appears successful' : 'Please complete signup manually',
      url: currentUrl,
    };

  } catch (error: any) {
    console.error('❌ G2A Goldmine automation error:', error.message);
    return {
      success: false,
      message: `Error: ${error.message}. Please complete signup manually.`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Run all affiliate signups
 */
export async function runAllAffiliateSignups(): Promise<void> {
  console.log('🚀 Starting affiliate program automation...\n');

  const results = [];

  // Amazon Associates
  console.log('📦 Amazon Associates...');
  const amazonResult = await automateAmazonAssociatesSignup();
  results.push({ program: 'Amazon Associates', ...amazonResult });
  console.log(`   ${amazonResult.success ? '✅' : '⚠️'} ${amazonResult.message}\n`);

  // Wait between signups
  await new Promise(resolve => setTimeout(resolve, 5000));

  // G2A Goldmine
  console.log('📦 G2A Goldmine...');
  const g2aResult = await automateG2AGoldmineSignup();
  results.push({ program: 'G2A Goldmine', ...g2aResult });
  console.log(`   ${g2aResult.success ? '✅' : '⚠️'} ${g2aResult.message}\n`);

  // Summary
  console.log('\n📊 SUMMARY:');
  results.forEach(result => {
    console.log(`   ${result.program}: ${result.success ? '✅ Success' : '⚠️ Needs manual completion'}`);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllAffiliateSignups()
    .then(() => {
      console.log('\n✅ Automation complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Automation failed:', err);
      process.exit(1);
    });
}

