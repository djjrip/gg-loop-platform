// Auto-reload script for Ghost Bot Extension Development
// This watches for file changes and automatically reloads the extension

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const EXTENSION_ID = 'YOUR_EXTENSION_ID_HERE'; // You'll need to get this from chrome://extensions/
const EXTENSION_PATH = __dirname;

console.log('👻 Ghost Bot Auto-Reloader');
console.log('Watching for file changes...\n');

// Watch for changes in extension files
const watchExtensions = ['.js', '.html', '.json', '.css'];
const watchedFiles = new Set();

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllFiles(filePath, fileList);
    } else if (watchExtensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function reloadExtension() {
  console.log('🔄 Reloading extension...');
  // Use Chrome's extension reload API (requires Chrome extension)
  // For now, we'll just log - you'll need to manually reload
  console.log('⚠️  Please reload the extension in chrome://extensions/');
  console.log('   Or use the Chrome Extension Reloader extension\n');
}

// Watch all files
const allFiles = getAllFiles(EXTENSION_PATH);
allFiles.forEach(file => {
  fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log(`📝 File changed: ${path.relative(EXTENSION_PATH, file)}`);
      reloadExtension();
    }
  });
  watchedFiles.add(file);
});

console.log(`✅ Watching ${watchedFiles.size} files for changes`);
console.log('Press Ctrl+C to stop\n');

