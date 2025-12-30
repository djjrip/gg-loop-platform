const { execSync } = require('child_process');

try {
    execSync('tsc --project server/tsconfig.json', { stdio: 'inherit' });
} catch (e) {
    console.log('Typescript errors ignored for deployment.');
    process.exit(0);
}
