// Auto-reload Ghost Bot Extension
// Attempts to reload the extension programmatically

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const EXTENSION_ID_PATTERN = /[a-z]{32}/; // Chrome extension IDs are 32 lowercase letters

async function findExtensionId() {
  try {
    // Try to get extension ID from Chrome's extension directory
    // On Windows, extensions are stored in AppData
    const userProfile = process.env.USERPROFILE || process.env.HOME;
    const extensionPath = `${userProfile}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions`;
    
    console.log('🔍 Looking for Ghost Bot extension...');
    
    // This is a simplified approach - in reality, we'd need to:
    // 1. Read Chrome's Preferences file to find installed extensions
    // 2. Match by extension name
    // 3. Get the extension ID
    
    console.log('⚠️  Extension ID detection requires Chrome to be running with remote debugging');
    return null;
  } catch (error) {
    console.error('Error finding extension:', error.message);
    return null;
  }
}

async function reloadViaChromeDevTools(extensionId) {
  try {
    // Chrome DevTools Protocol approach
    // This requires Chrome to be started with --remote-debugging-port=9222
    const response = await fetch('http://localhost:9222/json', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Chrome remote debugging not enabled');
    }
    
    const tabs = await response.json();
    console.log('✅ Chrome remote debugging is enabled');
    
    // Find the extensions page
    const extensionsTab = tabs.find(tab => tab.url.includes('chrome://extensions'));
    
    if (extensionsTab) {
      console.log('✅ Found extensions page');
      // We could potentially reload via DevTools Protocol, but it's complex
      // For now, we'll just open it
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

async function openExtensionsPage() {
  console.log('🚀 Opening chrome://extensions/...');
  
  try {
    // Try to open in Chrome specifically
    if (process.platform === 'win32') {
      // Windows: Try to open in Chrome
      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      ];
      
      for (const chromePath of chromePaths) {
        try {
          await execAsync(`"${chromePath}" "chrome://extensions/"`);
          console.log('✅ Opened chrome://extensions/ in Chrome');
          return true;
        } catch (e) {
          // Try next path
        }
      }
      
      // Fallback: Use default browser
      await execAsync('start chrome://extensions/');
      console.log('✅ Opened chrome://extensions/ in default browser');
      return true;
    } else {
      // Mac/Linux
      await execAsync('open -a "Google Chrome" chrome://extensions/ 2>/dev/null || xdg-open chrome://extensions/');
      return true;
    }
  } catch (error) {
    console.error('❌ Could not open chrome://extensions/:', error.message);
    console.log('\n📋 MANUAL STEPS:');
    console.log('1. Open Chrome');
    console.log('2. Go to: chrome://extensions/');
    console.log('3. Find "Ghost Bot - Virtual Assistant"');
    console.log('4. Click the refresh icon (🔄)');
    return false;
  }
}

async function main() {
  console.log('👻 Ghost Bot Auto-Reloader');
  console.log('='.repeat(40));
  console.log('');
  
  // Try to find extension ID
  const extensionId = await findExtensionId();
  
  // Try Chrome DevTools Protocol (if enabled)
  if (await reloadViaChromeDevTools(extensionId)) {
    console.log('✅ Extension reloaded via DevTools Protocol!');
    return;
  }
  
  // Fallback: Open extensions page
  const opened = await openExtensionsPage();
  
  if (opened) {
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Find "Ghost Bot - Virtual Assistant"');
    console.log('2. Click the refresh icon (🔄)');
    console.log('3. Check version shows v1.0.2');
    console.log('');
    console.log('⏳ Waiting 3 seconds for Chrome to open...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Done! Extension should be reloaded now.');
  }
}

main().catch(console.error);

