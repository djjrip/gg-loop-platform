// Auto-create Railway Cron Services
// Creates separate services for each cron job

import https from 'https';

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

const CRON_SERVICES = [
  {
    name: 'master-automation',
    displayName: 'Master Automation Orchestrator',
    schedule: '0 * * * *', // Every hour
    command: 'npx tsx server/masterAutomation.ts',
    description: 'Coordinates all automation systems, health checks, auto-approval'
  },
  {
    name: 'reward-fulfillment',
    displayName: 'Automated Reward Fulfillment',
    schedule: '*/15 * * * *', // Every 15 minutes
    command: 'npx tsx server/automation/rewardFulfillment.ts',
    description: 'Automatically fulfills rewards with affiliate links'
  }
];

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
            reject(new Error(`Railway API ${res.statusCode}: ${parsed.message || body}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Parse error: ${e.message} - ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getProject() {
  try {
    const projects = await railwayRequest('GET', '/v1/projects');
    if (!projects || !projects.projects || projects.projects.length === 0) {
      throw new Error('No Railway projects found');
    }

    const project = projects.projects.find(p => 
      p.name?.toLowerCase().includes('gg') || 
      p.name?.toLowerCase().includes('loop') ||
      p.name?.toLowerCase().includes('platform')
    ) || projects.projects[0];

    return { projectId: project.id, projectName: project.name };
  } catch (error) {
    throw new Error(`Failed to get project: ${error.message}`);
  }
}

async function createCronService(projectId, cronService) {
  try {
    console.log(`\n📋 Creating: ${cronService.displayName}`);
    
    // Railway creates cron services by creating a new service with a cron schedule
    // We'll use the Railway API to create a service
    const serviceData = {
      name: cronService.name,
      source: {
        repo: 'djjrip/gg-loop-platform',
        branch: 'main',
        rootDirectory: '/'
      },
      buildCommand: 'npm install',
      startCommand: cronService.command,
      cronSchedule: cronService.schedule
    };

    const result = await railwayRequest('POST', `/v1/projects/${projectId}/services`, serviceData);
    
    console.log(`✅ Created service: ${cronService.displayName}`);
    console.log(`   Schedule: ${cronService.schedule}`);
    console.log(`   Command: ${cronService.command}`);
    
    return true;
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log(`⚠️  Railway API doesn't support direct cron service creation`);
      return false;
    }
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 AUTO-CREATING RAILWAY CRON SERVICES');
  console.log('='.repeat(50));
  console.log('');

  try {
    const { projectId, projectName } = await getProject();
    console.log(`✅ Found project: ${projectName} (${projectId})`);

    const results = [];
    for (const cronService of CRON_SERVICES) {
      const success = await createCronService(projectId, cronService);
      results.push({ service: cronService.displayName, success });
    }

    const successCount = results.filter(r => r.success).length;
    
    if (successCount === CRON_SERVICES.length) {
      console.log('\n🎉 ALL CRON SERVICES CREATED!');
      console.log('✅ Automation will run automatically!');
    } else {
      console.log('\n⚠️  Railway API doesn't support automated cron service creation.');
      console.log('\n📋 MANUAL SETUP REQUIRED (5 minutes):');
      console.log('1. Go to: https://railway.app/dashboard');
      console.log('2. Select your project');
      console.log('3. Click "+ New" → "Empty Service"');
      console.log('4. For each cron job:\n');
      
      CRON_SERVICES.forEach((service, i) => {
        console.log(`   Service ${i + 1}: ${service.displayName}`);
        console.log(`   - Name: ${service.name}`);
        console.log(`   - Source: Connect to GitHub repo (djjrip/gg-loop-platform)`);
        console.log(`   - Root Directory: /`);
        console.log(`   - Build Command: npm install`);
        console.log(`   - Start Command: ${service.command}`);
        console.log(`   - Cron Schedule: ${service.schedule}`);
        console.log(`   - Copy all env vars from main service\n`);
      });
    }

  } catch (error) {
    console.error('\n❌ AUTOMATION FAILED:', error.message);
    console.log('\n📋 MANUAL SETUP (5 minutes):');
    console.log('Railway requires creating separate services for cron jobs.\n');
    console.log('See: RAILWAY_CRON_JOBS_SETUP.md for detailed instructions\n');
  }
}

main().catch(console.error);

