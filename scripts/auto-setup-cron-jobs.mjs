// Auto-setup Railway Cron Jobs
// Automatically configures all cron jobs for GG LOOP

import https from 'https';

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

// Cron jobs to set up
const CRON_JOBS = [
  {
    name: 'Master Automation Orchestrator',
    schedule: '0 * * * *', // Every hour
    command: 'npm run automate:business',
    description: 'Coordinates all automation systems, health checks, auto-approval'
  },
  {
    name: 'Automated Reward Fulfillment',
    schedule: '*/15 * * * *', // Every 15 minutes
    command: 'npm run automate:fulfillment',
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
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getProjectAndService() {
  console.log('📡 Fetching Railway project and service...');
  
  try {
    // Get projects
    const projects = await railwayRequest('GET', '/v1/projects');
    if (!projects || !projects.projects || projects.projects.length === 0) {
      throw new Error('No Railway projects found');
    }

    const project = projects.projects.find(p => 
      p.name?.toLowerCase().includes('gg') || 
      p.name?.toLowerCase().includes('loop') ||
      p.name?.toLowerCase().includes('platform')
    ) || projects.projects[0];

    console.log(`✅ Found project: ${project.name} (${project.id})`);

    // Get services
    const services = await railwayRequest('GET', `/v1/projects/${project.id}/services`);
    if (!services || !services.services || services.services.length === 0) {
      throw new Error('No services found in project');
    }

    const service = services.services[0];
    console.log(`✅ Found service: ${service.name || 'default'} (${service.id})`);

    return { projectId: project.id, serviceId: service.id, projectName: project.name };
  } catch (error) {
    console.error('❌ Error fetching project/service:', error.message);
    throw error;
  }
}

async function setupCronJob(projectId, serviceId, cronJob) {
  console.log(`\n📋 Setting up: ${cronJob.name}`);
  console.log(`   Schedule: ${cronJob.schedule}`);
  console.log(`   Command: ${cronJob.command}`);

  try {
    // Railway cron jobs are set up via the service's cron configuration
    // We'll use the Railway API to create a cron job
    const cronConfig = {
      schedule: cronJob.schedule,
      command: cronJob.command
    };

    // Note: Railway's cron API might be different - this is the general approach
    // If Railway uses a different endpoint, we'll need to adjust
    const result = await railwayRequest('POST', `/v1/projects/${projectId}/services/${serviceId}/cron`, cronConfig);
    
    console.log(`✅ Cron job "${cronJob.name}" set up successfully!`);
    return true;
  } catch (error) {
    // If cron endpoint doesn't exist, we'll provide manual instructions
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log(`⚠️  Cron API endpoint not available. Railway may require manual setup.`);
      console.log(`   Manual setup needed for: ${cronJob.name}`);
      return false;
    }
    console.error(`❌ Failed to set up "${cronJob.name}":`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 AUTO-SETTING UP RAILWAY CRON JOBS');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Get project and service
    const { projectId, serviceId, projectName } = await getProjectAndService();

    console.log(`\n🎯 Setting up ${CRON_JOBS.length} cron jobs for: ${projectName}`);
    console.log('');

    const results = [];
    for (const cronJob of CRON_JOBS) {
      const success = await setupCronJob(projectId, serviceId, cronJob);
      results.push({ cronJob: cronJob.name, success });
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 CRON JOB SETUP SUMMARY');
    console.log('='.repeat(50));

    results.forEach((result, i) => {
      const icon = result.success ? '✅' : '⚠️';
      console.log(`${icon} ${result.cronJob}`);
    });

    const successCount = results.filter(r => r.success).length;
    
    if (successCount === CRON_JOBS.length) {
      console.log('\n🎉 ALL CRON JOBS SET UP SUCCESSFULLY!');
      console.log('✅ Business automation will run automatically!');
    } else {
      console.log('\n⚠️  Some cron jobs need manual setup.');
      console.log('\n📋 MANUAL SETUP INSTRUCTIONS:');
      console.log('1. Go to: https://railway.app/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to Settings → Cron Jobs');
      console.log('4. Add these cron jobs:\n');
      
      CRON_JOBS.forEach((job, i) => {
        if (!results[i].success) {
          console.log(`   ${job.name}:`);
          console.log(`   Schedule: ${job.schedule}`);
          console.log(`   Command: ${job.command}\n`);
        }
      });
    }

  } catch (error) {
    console.error('\n❌ AUTOMATION FAILED:', error.message);
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('1. Go to: https://railway.app/dashboard');
    console.log('2. Select your project → Settings → Cron Jobs');
    console.log('3. Add these cron jobs:\n');
    
    CRON_JOBS.forEach(job => {
      console.log(`   Name: ${job.name}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   Command: ${job.command}`);
      console.log(`   Description: ${job.description}\n`);
    });
  }
}

main().catch(console.error);

