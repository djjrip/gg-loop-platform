#!/usr/bin/env node
/**
 * 🤖 SET RAILWAY VARIABLES AUTOMATICALLY
 * Uses your token to set all variables via Railway API
 */

import https from 'https';

const RAILWAY_TOKEN = '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

// All variables to set
const VARIABLES = {
  'VITE_PAYPAL_CLIENT_ID': 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
  'PAYPAL_CLIENT_ID': 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
  'PAYPAL_CLIENT_SECRET': 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL',
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
function railwayAPI(method, path, data = null) {
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
            reject(new Error(`Railway API ${res.statusCode}: ${body.substring(0, 200)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Railway API ${res.statusCode}: ${body.substring(0, 200)}`));
          }
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
 * Get project and service IDs
 */
async function getProjectAndService() {
  console.log('🔍 Finding your Railway project...\n');
  
  try {
    // Get projects
    const projects = await railwayAPI('GET', '/v1/projects');
    
    if (!projects || projects.length === 0) {
      throw new Error('No projects found');
    }
    
    // Find GG LOOP project
    const project = projects.find(p => 
      p.name?.toLowerCase().includes('gg') || 
      p.name?.toLowerCase().includes('loop') ||
      p.name?.toLowerCase().includes('platform')
    ) || projects[0];
    
    console.log(`✅ Found project: ${project.name} (${project.id})\n`);
    
    // Get services
    const services = await railwayAPI('GET', `/v1/projects/${project.id}/services`);
    
    if (!services || services.length === 0) {
      throw new Error('No services found');
    }
    
    // Find web service (not database)
    const service = services.find(s => 
      !s.name?.toLowerCase().includes('postgres') &&
      !s.name?.toLowerCase().includes('database') &&
      !s.name?.toLowerCase().includes('db')
    ) || services[0];
    
    console.log(`✅ Found service: ${service.name} (${service.id})\n`);
    
    return { projectId: project.id, serviceId: service.id };
    
  } catch (error) {
    console.error('❌ Error finding project:', error.message);
    throw error;
  }
}

/**
 * Set a single variable
 */
async function setVariable(projectId, serviceId, key, value) {
  try {
    // Delete existing first (to avoid duplicates)
    try {
      await railwayAPI('DELETE', `/v1/projects/${projectId}/services/${serviceId}/variables/${encodeURIComponent(key)}`);
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    // Set the variable
    await railwayAPI('POST', `/v1/projects/${projectId}/services/${serviceId}/variables`, {
      key: key,
      value: value
    });
    
    console.log(`   ✅ ${key}`);
    return true;
  } catch (error) {
    console.error(`   ❌ ${key}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 AUTOMATED RAILWAY VARIABLE SETUP\n');
  console.log('Using your token to set all variables...\n');
  
  try {
    const { projectId, serviceId } = await getProjectAndService();
    
    console.log('📝 Setting environment variables...\n');
    
    let successCount = 0;
    for (const [key, value] of Object.entries(VARIABLES)) {
      if (await setVariable(projectId, serviceId, key, value)) {
        successCount++;
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`\n📊 SETUP COMPLETE!\n`);
    console.log(`   Variables set: ${successCount}/${Object.keys(VARIABLES).length}\n`);
    
    if (successCount === Object.keys(VARIABLES).length) {
      console.log('✅ All variables set successfully!');
      console.log('🚀 Railway will auto-redeploy in 2-3 minutes');
      console.log('🧪 Test: https://ggloop.io/subscription\n');
    } else {
      console.log('⚠️  Some variables failed to set');
      console.log('💡 Check Railway dashboard manually\n');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Alternative: Use Railway dashboard manually');
    console.log('   See: AUTOMATE_WITH_TOKEN.md for all values\n');
    process.exit(1);
  }
}

main().catch(console.error);

