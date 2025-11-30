#!/usr/bin/env node
// scripts/validate-env.cjs
const requiredInProduction = [
  'DATABASE_URL',
  'ADMIN_EMAILS',
  'SESSION_SECRET'
];

const warnings = [];
const errors = [];

function checkRequired() {
  if (process.env.NODE_ENV === 'production') {
    requiredInProduction.forEach((k) => {
      if (!process.env[k]) errors.push(`${k} is required in production`);
    });

    // Session store
    const sessionStore = process.env.SESSION_STORE || 'memory';
    if (sessionStore === 'redis' && !process.env.REDIS_URL) {
      errors.push('SESSION_STORE=redis requires REDIS_URL to be set');
    }

    // Tango integration safety
    if (process.env.ENABLE_TANGO_INTEGRATION === 'true') {
      if (!process.env.TANGO_CARD_PLATFORM_NAME || !process.env.TANGO_CARD_PLATFORM_KEY) {
        errors.push('ENABLE_TANGO_INTEGRATION=true but Tango credentials are missing');
      }
    }
  } else {
    // Non-production suggestions
    if (!process.env.SESSION_SECRET) warnings.push('SESSION_SECRET not set in non-production environment');
  }
}

checkRequired();

if (errors.length > 0) {
  console.error('\n[validate-env] Errors detected:');
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('\n[validate-env] Warnings:');
  warnings.forEach((w) => console.warn(' - ' + w));
}

console.log('[validate-env] Environment validation passed');
process.exit(0);
