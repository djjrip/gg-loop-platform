const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '../server');
const SHARED_DIR = path.join(__dirname, '../shared');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(SERVER_DIR);
let fixedCount = 0;

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const dirName = path.dirname(filePath);

    // existing @shared/schema or similar imports
    // Regex to look for import ... from "@shared/..." or import(...)
    const regex = /['"]@shared\/([^'"]+)['"]/g;

    if (regex.test(content)) {
        const relativeSharedPath = path.relative(dirName, SHARED_DIR).replace(/\\/g, '/');

        const newContent = content.replace(regex, (match, p1) => {
            // p1 is "schema" or whatever is after @shared/
            // Need to ensure relative path starts with . if it's in the same dir (not likely here)
            // but relative path from server/foo to shared is ../../shared

            let relPath = relativeSharedPath;
            if (!relPath.startsWith('.')) {
                relPath = './' + relPath;
            }

            return `"${relPath}/${p1}"`;
        });

        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Fixed imports in: ${path.relative(SERVER_DIR, filePath)}`);
            fixedCount++;
        }
    }
});

console.log(`\nRefactoring complete. Fixed ${fixedCount} files.`);
