const fs = require('fs');

const content = fs.readFileSync('server/routes.ts', 'utf8');
const lines = content.split('\n');

// Remove line 4407 (array index 4406) which is the extra closing brace
lines.splice(4406, 1);

fs.writeFileSync('server/routes.ts', lines.join('\n'), 'utf8');
console.log('✅ Removed extra closing brace from line 4407');
