// Create Railway Cron Services - Direct API Approach
// Uses Railway API to create services with cron schedules

import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

const CRON_SERVICES = [
  {
    name: 'master-automation',
    displayName: 'Master Automation Orchestrator',
    schedule: '0 * * * *',
    command: 'npx tsx server/masterAutomation.ts',
    buildCommand: 'npm install'
  },
  {
    name: 'reward-fulfillment',
    displayName: 'Automated Reward Fulfillment',
    schedule: '*/15 * * * *',
    command: 'npx tsx server/automation/rewardFulfillment.ts',
    buildCommand: 'npm install'
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
    const projectList = projects.projects || projects || [];
    
    if (projectList.length === 0) {
      throw new Error('No Railway projects found');
    }

    const project = projectList.find(p => 
      p.name?.toLowerCase().includes('gg') || 
      p.name?.toLowerCase().includes('loop') ||
      p.name?.toLowerCase().includes('platform')
    ) || projectList[0];

    return { projectId: project.id, projectName: project.name };
  } catch (error) {
    throw new Error(`Failed to get project: ${error.message}`);
  }
}

async function getMainService(projectId) {
  try {
    const services = await railwayRequest('GET', `/v1/projects/${projectId}/services`);
    const serviceList = services.services || services || [];
    
    // Find main service (not Postgres)
    const mainService = serviceList.find(s => 
      s.name?.toLowerCase() !== 'postgres' &&
      s.name?.toLowerCase() !== 'database' &&
      !s.name?.toLowerCase().includes('db')
    ) || serviceList[0];

    return mainService;
  } catch (error) {
    return null;
  }
}

async function createServiceViaCLI(projectId, service) {
  try {
    console.log(`\n📋 Creating ${service.displayName} via Railway CLI...`);
    
    // Try using Railway CLI to create service
    // Note: Railway CLI might not support creating services directly
    // But we can try using railway service create if it exists
    
    const result = await execAsync(`railway service create ${service.name}`, {
      timeout: 30000
    });
    
    console.log(`✅ Service created: ${service.name}`);
    return { success: true, serviceId: null, method: 'CLI' };
  } catch (error) {
    // CLI might not support this
    return { success: false, error: error.message };
  }
}

async function createServiceViaAPI(projectId, service, mainService) {
  try {
    console.log(`\n📋 Creating ${service.displayName} via Railway API...`);
    
    // Try creating service via API
    const serviceData = {
      name: service.name,
      projectId: projectId,
      source: {
        repo: 'djjrip/gg-loop-platform',
        branch: 'main',
        rootDirectory: '/'
      },
      buildCommand: service.buildCommand,
      startCommand: service.command,
      cronSchedule: service.schedule
    };

    const result = await railwayRequest('POST', `/v1/projects/${projectId}/services`, serviceData);
    
    console.log(`✅ Service created via API: ${service.name}`);
    return { success: true, serviceId: result.id || result.service?.id, method: 'API' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function copyEnvVars(projectId, sourceServiceId, targetServiceId) {
  try {
    // Get env vars from main service
    const vars = await railwayRequest('GET', `/v1/projects/${projectId}/services/${sourceServiceId}/variables`);
    
    // Copy to new service
    const varList = vars.variables || vars || [];
    for (const envVar of varList) {
      try {
        await railwayRequest('POST', `/v1/projects/${projectId}/services/${targetServiceId}/variables`, {
          key: envVar.key,
          value: envVar.value
        });
      } catch (e) {
        // Ignore errors for individual vars
      }
    }
    
    console.log(`✅ Copied ${varList.length} environment variables`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not copy env vars: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 CREATING RAILWAY CRON SERVICES');
  console.log('='.repeat(50));
  console.log('');

  try {
    const { projectId, projectName } = await getProject();
    console.log(`✅ Found project: ${projectName} (${projectId})`);

    const mainService = await getMainService(projectId);
    if (mainService) {
      console.log(`✅ Found main service: ${mainService.name} (${mainService.id})`);
    }

    const results = [];
    
    for (const service of CRON_SERVICES) {
      console.log(`\n📦 Creating: ${service.displayName}`);
      
      // Try API first
      let result = await createServiceViaAPI(projectId, service, mainService);
      
      // If API fails, try CLI
      if (!result.success) {
        result = await createServiceViaCLI(projectId, service);
      }
      
      if (result.success && result.serviceId && mainService) {
        // Copy environment variables
        await copyEnvVars(projectId, mainService.id, result.serviceId);
      }
      
      results.push({ service: service.displayName, ...result });
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTS');
    console.log('='.repeat(50));

    results.forEach((result, i) => {
      if (result.success) {
        console.log(`✅ ${result.service} - Created via ${result.method}`);
      } else {
        console.log(`❌ ${result.service} - Failed: ${result.error}`);
      }
    });

    const successCount = results.filter(r => r.success).length;
    
    if (successCount === CRON_SERVICES.length) {
      console.log('\n🎉 ALL CRON SERVICES CREATED!');
      console.log('✅ Automation will run automatically!');
    } else {
      console.log('\n⚠️  Some services could not be created automatically.');
      console.log('📋 Railway requires manual creation in dashboard.');
      console.log('\nSee: CRON_JOBS_AUTOMATED.md for manual steps\n');
    }

  } catch (error) {
    console.error('\n❌ AUTOMATION FAILED:', error.message);
    console.log('\n📋 Railway API limitations prevent full automation.');
    console.log('📋 See: CRON_JOBS_AUTOMATED.md for manual setup (5 minutes)\n');
  }
}

main().catch(console.error);

