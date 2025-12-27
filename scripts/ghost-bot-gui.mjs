#!/usr/bin/env node
/**
 * 👻 GHOST BOT GUI - Desktop App
 * 
 * Simple GUI wrapper for the ghost bot launcher
 * Can be pinned to desktop and taskbar
 */

import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('👻 GHOST BOT LAUNCHER');
console.log('='.repeat(50));
console.log('\n🚀 Starting Ghost Bot...\n');

// Import and run the launcher
import('./ghost-launcher.mjs').then(() => {
  console.log('✅ Ghost Bot is running!\n');
}).catch(error => {
  console.error('❌ Error starting Ghost Bot:', error.message);
  console.log('\n💡 Make sure you have Node.js installed');
  console.log('   Run: npm install\n');
  process.exit(1);
});

