const { execSync } = require('child_process');

try {
    execSync('tsc --project server/tsconfig.json', { stdio: 'inherit' });
} catch (e) {
    console.error('❌ TypeScript compilation failed:', e.message);
    process.exit(1);
}
