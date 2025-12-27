#!/usr/bin/env node
/**
 * Test Railway API connection
 */

import https from 'https';

const RAILWAY_TOKEN = '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

function railwayRequest(method, path) {
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
          console.log(`Status: ${res.statusCode}`);
          console.log(`Response:`, JSON.stringify(parsed, null, 2));
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API error: ${res.statusCode}`));
          }
        } catch (e) {
          console.log('Raw response:', body);
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('Testing Railway API...\n');
  
  try {
    console.log('1. Testing projects endpoint...');
    const projects = await railwayRequest('GET', '/v1/projects');
    console.log('✅ Projects:', projects);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();

