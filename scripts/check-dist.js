#!/usr/bin/env node
// scripts/check-dist.js
// Scans the dist/ folder for disallowed / legacy phrases that indicate inflated claims or live Tango claims.
// Exits with code 1 if any matches are found. Helpful for CI and pre-deploy checks.

const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');
const patterns = [
  { regex: /\bCurrently serving\b/i, note: 'claims current active users' },
  { regex: /\b1K users\b|\b1,000 users\b/i, note: '1k user claim (should be aspirational)' },
  { regex: /\$5K\/month\b/i, note: '$5K/month claim (should be aspirational or removed)' },
  { regex: /\$100K\b|100K credits\b|\$100k\b/i, note: 'previous $100K AWS credits ask' },
  { regex: /50K concurrent\b|50,000 concurrent\b/i, note: '50k concurrent claim' },
  { regex: /99\.99%/i, note: '99.99% uptime claim (should be aspirational)' },
  { regex: /Tango Card|TangoCard|Tango Card API|Tango Card integration|Tango Card redemption|TANGO_CARD/gi, note: 'Tango Card references' }
];

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, cb);
    else cb(full);
  }
}

let found = [];
if (!fs.existsSync(distPath)) {
  console.error('dist/ folder not found. Build first or verify the build step.');
  process.exit(64);
}

walkDir(distPath, (filePath) => {
  // only scan textful files
  const ext = path.extname(filePath).toLowerCase();
  if (!['.js', '.css', '.html', '.json', '.txt'].includes(ext)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const p of patterns) {
    if (p.regex.test(content)) {
      found.push({ file: filePath.replace(process.cwd() + '/', ''), pattern: p.regex.toString(), note: p.note });
    }
  }
});

if (found.length > 0) {
  console.error('\n[verify:dist] Detected potentially unwanted strings in dist/ (this may be OK in code but should be reviewed):\n');
  for (const f of found) {
    console.error(` - ${f.file} — ${f.note} — pattern: ${f.pattern}`);
  }
  console.error('\nIf these are expected or safe (e.g., code guard exists), consider adding an exception, otherwise update the source and rebuild.');
  process.exit(1);
} else {
  console.log('[verify:dist] No disallowed patterns found — dist appears clean.');
  process.exit(0);
}
