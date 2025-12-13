const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'routes.ts');

// Read current content
const content = fs.readFileSync(filePath, 'utf8');

// Add closing bracket
const fixed = content + '}';

// Write back
fs.writeFileSync(filePath, fixed, 'utf8');

console.log('✅ Added closing bracket to routes.ts');
console.log('📍 File now ends with proper function closure');
