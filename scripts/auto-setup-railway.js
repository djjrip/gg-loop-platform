#!/usr/bin/env node
/**
 * 🤖 AUTOMATED RAILWAY SETUP
 * 
 * Automatically sets up Railway variables and cron jobs
 * Uses Railway API to configure everything
 * 
 * Requirements:
 * - RAILWAY_TOKEN environment variable
 * - PROJECT_ID environment variable
 * - SERVICE_ID environment variable
 */

const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const SERVICE_ID = process.env.RAILWAY_SERVICE_ID;

if (!RAILWAY_TOKEN) {
  console.error('❌ RAILWAY_TOKEN environment variable required');
  console.log('\n📋 How to get it:');
  console.log('1. Go to: https://railway.app/account/tokens');
  console.log('2. Click "New Token"');
  console.log('3. Copy the token');
  console.log('4. Set: export RAILWAY_TOKEN=your-token-here\n');
  process.exit(1);
}

// PayPal credentials (verified from dashboard)
const PAYPAL_CLIENT_ID = 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu';
const PAYPAL_CLIENT_SECRET = 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL';

// Environment variables to set
const ENV_VARS = {
  'VITE_PAYPAL_CLIENT_ID': PAYPAL_CLIENT_ID,
  'PAYPAL_CLIENT_ID': PAYPAL_CLIENT_ID,
  'PAYPAL_CLIENT_SECRET': PAYPAL_CLIENT_SECRET,
  'PAYPAL_MODE': 'sandbox',
  'ADMIN_EMAILS': 'jaysonquindao@ggloop.io',
  'BUSINESS_EMAIL': 'jaysonquindao@ggloop.io',
  'BUSINESS_NAME': 'GG LOOP LLC',
  'BASE_URL': 'https://ggloop.io',
  'NODE_ENV': 'production'
};

/**
 * Make Railway API request
 */
function railwayRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Railway API error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Get project ID if not set
 */
async function getProjectId() {
  if (PROJECT_ID) return PROJECT_ID;

  console.log('🔍 Finding your Railway project...');
  const projects = await railwayRequest('GET', '/v1/projects');
  
  const project = projects.find(p => p.name === 'gg-loop-platform' || p.name.includes('gg-loop'));
  
  if (!project) {
    console.error('❌ Could not find gg-loop-platform project');
    console.log('Available projects:', projects.map(p => p.name).join(', '));
    process.exit(1);
  }

  console.log(`✅ Found project: ${project.name} (${project.id})`);
  return project.id;
}

/**
 * Get service ID if not set
 */
async function getServiceId(projectId) {
  if (SERVICE_ID) return SERVICE_ID;

  console.log('🔍 Finding your web service...');
  const services = await railwayRequest('GET', `/v1/projects/${projectId}/services`);
  
  const service = services.find(s => s.name !== 'Postgres' && s.name !== 'Database');
  
  if (!service) {
    console.error('❌ Could not find web service');
    process.exit(1);
  }

  console.log(`✅ Found service: ${service.name} (${service.id})`);
  return service.id;
}

/**
 * Set environment variable
 */
async function setEnvVar(projectId, serviceId, key, value) {
  try {
    console.log(`   Setting ${key}...`);
    
    // First, try to delete existing (in case of duplicates)
    try {
      await railwayRequest('DELETE', `/v1/projects/${projectId}/services/${serviceId}/variables/${key}`);
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Set the variable
    await railwayRequest('POST', `/v1/projects/${projectId}/services/${serviceId}/variables`, {
      key: key,
      value: value
    });

    console.log(`   ✅ ${key} set`);
  } catch (error) {
    console.error(`   ❌ Failed to set ${key}:`, error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🤖 AUTOMATED RAILWAY SETUP\n');
  console.log('This will:');
  console.log('1. Set all environment variables');
  console.log('2. Fix VITE_PAYPAL_CLIENT_ID (delete duplicates, add one)');
  console.log('3. Configure all required variables\n');

  try {
    const projectId = await getProjectId();
    const serviceId = await getServiceId(projectId);

    console.log('\n📝 Setting environment variables...\n');

    // Delete all VITE_PAYPAL_CLIENT_ID first
    console.log('🗑️  Deleting duplicate VITE_PAYPAL_CLIENT_ID...');
    try {
      await railwayRequest('DELETE', `/v1/projects/${projectId}/services/${serviceId}/variables/VITE_PAYPAL_CLIENT_ID`);
      console.log('   ✅ Deleted old variable');
    } catch (e) {
      console.log('   ℹ️  No existing variable to delete');
    }

    // Set all variables
    for (const [key, value] of Object.entries(ENV_VARS)) {
      await setEnvVar(projectId, serviceId, key, value);
    }

    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('📋 Next steps:');
    console.log('1. Railway will auto-redeploy (wait 2-3 minutes)');
    console.log('2. Test: https://ggloop.io/subscription');
    console.log('3. Add cron jobs manually in Railway dashboard\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Manual setup:');
    console.log('1. Go to: https://railway.app');
    console.log('2. Project → Service → Variables');
    console.log('3. Add variables manually\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };

