// Configure Railway Services - Set start commands and cron schedules
// Uses Railway API to configure the services we just created

import https from 'https';

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

const SERVICES = [
  {
    name: 'master-automation',
    startCommand: 'npx tsx server/masterAutomation.ts',
    cronSchedule: '0 * * * *'
  },
  {
    name: 'reward-fulfillment',
    startCommand: 'npx tsx server/automation/rewardFulfillment.ts',
    cronSchedule: '*/15 * * * *'
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

async function getProjectAndServices() {
  try {
    const projects = await railwayRequest('GET', '/v1/projects');
    const projectList = projects.projects || projects || [];
    const project = projectList.find(p => 
      p.name?.toLowerCase().includes('gg') || 
      p.name?.toLowerCase().includes('loop')
    ) || projectList[0];

    const services = await railwayRequest('GET', `/v1/projects/${project.id}/services`);
    const serviceList = services.services || services || [];

    return { projectId: project.id, services: serviceList };
  } catch (error) {
    throw new Error(`Failed: ${error.message}`);
  }
}

async function configureService(projectId, serviceId, serviceConfig) {
  try {
    console.log(`\n📋 Configuring: ${serviceConfig.name}...`);

    // Try to update service configuration
    const updateData = {
      startCommand: serviceConfig.startCommand,
      cronSchedule: serviceConfig.cronSchedule
    };

    const result = await railwayRequest('PATCH', `/v1/projects/${projectId}/services/${serviceId}`, updateData);
    
    console.log(`✅ Configured: ${serviceConfig.name}`);
    console.log(`   Start Command: ${serviceConfig.startCommand}`);
    console.log(`   Cron Schedule: ${serviceConfig.cronSchedule}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not configure via API: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 CONFIGURING RAILWAY SERVICES');
  console.log('='.repeat(50));
  console.log('');

  try {
    const { projectId, services } = await getProjectAndServices();
    console.log(`✅ Found project and ${services.length} services\n`);

    const results = [];
    
    for (const serviceConfig of SERVICES) {
      const service = services.find(s => 
        s.name === serviceConfig.name || 
        s.name?.toLowerCase().includes(serviceConfig.name.toLowerCase())
      );

      if (service) {
        console.log(`✅ Found service: ${service.name} (${service.id})`);
        const success = await configureService(projectId, service.id, serviceConfig);
        results.push({ service: serviceConfig.name, success });
      } else {
        console.log(`⚠️  Service not found: ${serviceConfig.name}`);
        results.push({ service: serviceConfig.name, success: false, error: 'Service not found' });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 CONFIGURATION RESULTS');
    console.log('='.repeat(50));

    const successCount = results.filter(r => r.success).length;
    
    results.forEach((result) => {
      if (result.success) {
        console.log(`✅ ${result.service} - Configured!`);
      } else {
        console.log(`⚠️  ${result.service} - Needs manual configuration`);
      }
    });

    if (successCount === SERVICES.length) {
      console.log('\n🎉 ALL SERVICES CONFIGURED!');
      console.log('✅ Automation will run automatically!');
    } else {
      console.log('\n⚠️  Some services need manual configuration.');
      console.log('📋 Railway API may not support updating start commands/cron schedules.');
      console.log('📋 See: SERVICES_CREATED_NEXT_STEPS.md for manual steps.\n');
    }

  } catch (error) {
    console.error('\n❌ CONFIGURATION FAILED:', error.message);
    console.log('\n📋 Railway API limitations prevent full automation.');
    console.log('📋 See: SERVICES_CREATED_NEXT_STEPS.md for manual configuration.\n');
  }
}

main().catch(console.error);

