// Simple script to create ghost icons using Node.js and canvas
// Run: node create-icons-simple.js

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, create a simple SVG-based approach or use a base64 encoded simple icon
// Since we don't have canvas in Node, let's create simple PNG placeholders
// Actually, let's just create a simple script that generates the icons

console.log('Creating ghost icons...');

// Create a simple base64 encoded 1x1 transparent PNG as placeholder
// Then we'll replace with actual icons
const transparentPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// Write placeholder icons
[16, 48, 128].forEach(size => {
  // For now, create a simple colored square with ghost emoji
  // In production, you'd want actual PNG icons
  const iconPath = path.join(iconsDir, `ghost-${size}.png`);
  
  // Create a simple SVG and convert, or use a library
  // For simplicity, let's create a minimal valid PNG
  fs.writeFileSync(iconPath, transparentPNG);
  console.log(`Created ${iconPath}`);
});

console.log('Icons created! Note: These are placeholders. For production, use actual ghost icon images.');

