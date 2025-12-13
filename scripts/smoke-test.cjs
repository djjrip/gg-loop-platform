#!/usr/bin/env node
// scripts/smoke-test.cjs — simple health check against local server to validate build + runtime
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:5000';

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(base + path, (res) => {
      const { statusCode } = res;
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ statusCode, body: raw }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('[smoke-test] Hitting /');
    const root = await request('/');
    if (root.statusCode !== 200) {
      console.error('[smoke-test] / did not return 200:', root.statusCode);
      process.exit(1);
    }
    console.log('[smoke-test] / OK');

    console.log('[smoke-test] Hitting /api/tango/catalog');
    const t = await request('/api/tango/catalog');
    console.log('[smoke-test] /api/tango/catalog status:', t.statusCode);
    if (t.statusCode === 200) {
      if (t.body && t.body.length > 0) {
        console.log('[smoke-test] /api/tango/catalog returned data length:', t.body.length);
      } else {
        console.log('[smoke-test] /api/tango/catalog returned empty/placeholder result');
      }
    }

    console.log('[smoke-test] Completed smoke tests — basic checks OK');
    process.exit(0);
  } catch (err) {
    console.error('[smoke-test] Failed:', err);
    process.exit(1);
  }
})();
