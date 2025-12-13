import { readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

const envPath = '.env';
let envContent = '';

try {
    envContent = readFileSync(envPath, 'utf-8');
} catch (error) {
    console.log('.env file not found, creating new one...');
}

// Generate a secure random session secret
const sessionSecret = randomBytes(32).toString('hex');

// Check if SESSION_SECRET exists
if (envContent.includes('SESSION_SECRET=')) {
    // Replace existing SESSION_SECRET
    envContent = envContent.replace(
        /SESSION_SECRET=.*/,
        `SESSION_SECRET=${sessionSecret}`
    );
    console.log('Updated existing SESSION_SECRET');
} else {
    // Add SESSION_SECRET
    if (!envContent.endsWith('\n') && envContent.length > 0) {
        envContent += '\n';
    }
    envContent += `SESSION_SECRET=${sessionSecret}\n`;
    console.log('Added new SESSION_SECRET');
}

// Ensure other required vars exist with defaults
const requiredVars = {
    'PORT': '5000',
    'BASE_URL': 'http://localhost:5000',
};

for (const [key, defaultValue] of Object.entries(requiredVars)) {
    if (!envContent.includes(`${key}=`)) {
        envContent += `${key}=${defaultValue}\n`;
        console.log(`Added ${key}=${defaultValue}`);
    }
}

writeFileSync(envPath, envContent);
console.log('\n✅ .env file updated successfully!');
console.log(`SESSION_SECRET has been set to a secure random value.`);
