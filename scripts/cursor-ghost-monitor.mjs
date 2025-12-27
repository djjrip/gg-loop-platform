#!/usr/bin/env node
/**
 * Cursor Ghost Bot Monitor
 * 
 * I (Cursor) use this to see what Ghost Bot is doing in real-time
 * Run this to monitor Ghost Bot activity
 */

import { readFile } from 'fs/promises';
import { watchFile } from 'fs';

const STATUS_FILE = 'ghost-bot-status.json';
const TASKS_FILE = 'ghost-bot-tasks.json';

async function readStatus() {
  try {
    const data = await readFile(STATUS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function readTasks() {
  try {
    const data = await readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function displayStatus(status) {
  if (!status) {
    console.log('👻 Ghost Bot: Not connected');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('👻 GHOST BOT STATUS');
  console.log('='.repeat(50));
  console.log(`Type: ${status.type}`);
  console.log(`Message: ${status.message || 'N/A'}`);
  if (status.tab) {
    console.log(`Tab: ${status.tab.title || status.tab.url}`);
  }
  if (status.timestamp) {
    console.log(`Time: ${new Date(status.timestamp).toLocaleString()}`);
  }
  console.log('='.repeat(50) + '\n');
}

async function monitor() {
  console.log('👻 Cursor Ghost Bot Monitor');
  console.log('Watching Ghost Bot activity...\n');
  
  // Initial read
  const initialStatus = await readStatus();
  if (initialStatus) {
    displayStatus(initialStatus);
  }
  
  // Watch for changes
  watchFile(STATUS_FILE, async () => {
    const status = await readStatus();
    if (status) {
      displayStatus(status);
    }
  });
  
  // Also check tasks
  setInterval(async () => {
    const tasks = await readTasks();
    const pending = tasks.filter(t => !t.completed);
    if (pending.length > 0) {
      console.log(`📋 ${pending.length} pending task(s) for Ghost Bot`);
    }
  }, 5000);
}

monitor().catch(console.error);

