const fs = require('fs');

// Read the file
const content = fs.readFileSync('server/routes.ts', 'utf8');

// Add closing bracket
const fixed = content + '}\n';

// Write it back
fs.writeFileSync('server/routes.ts', fixed, 'utf8');

console.log('✅ Added closing bracket to routes.ts');
