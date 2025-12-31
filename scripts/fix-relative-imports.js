const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '../server');

// Get only files in SERVER_DIR root (non-recursive)
const files = fs.readdirSync(SERVER_DIR).filter(file => {
    return fs.statSync(path.join(SERVER_DIR, file)).isFile() &&
        (file.endsWith('.ts') || file.endsWith('.js'));
});

let fixedCount = 0;

files.forEach(file => {
    const filePath = path.join(SERVER_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace ../database with ./database
    // We use regex to match imports using quotes
    const regex = /from\s+['"]\.\.\/database['"]/g;

    if (regex.test(content)) {
        const newContent = content.replace(regex, "from './database'");
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed import in: ${file}`);
        fixedCount++;
    }
});

console.log(`\nRefactoring complete. Fixed ${fixedCount} files.`);
