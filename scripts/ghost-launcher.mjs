#!/usr/bin/env node
/**
 * 🚀 GHOST BOT LAUNCHER
 * 
 * Toggle the ghost bot on/off
 * Ask questions and get answers filled automatically
 * Control your virtual ghost assistant
 * 
 * Usage:
 *   npm run ghost:launch
 */

import puppeteer from 'puppeteer-core';
import readline from 'readline';
import { EventEmitter } from 'events';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class GhostBotLauncher extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.browser = null;
    this.currentPage = null;
  }

  /**
   * Connect to existing browser
   */
  async connect() {
    try {
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
      }).catch(async () => {
        // Try to launch Chrome with remote debugging
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const chromePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        ];
        
        for (const path of chromePaths) {
          try {
            const fs = await import('fs');
            if (fs.existsSync(path)) {
              console.log(`   🚀 Starting Chrome with remote debugging...`);
              execAsync(`"${path}" --remote-debugging-port=9222 --user-data-dir="${process.env.TEMP}\\chrome-ghost-bot"`);
              await new Promise(resolve => setTimeout(resolve, 3000));
              return await puppeteer.connect({
                browserURL: 'http://localhost:9222',
                defaultViewport: null
              });
            }
          } catch (e) {
            continue;
          }
        }
        
        throw new Error('Chrome not found. Please start Chrome manually with: chrome.exe --remote-debugging-port=9222');
      });
      
      return true;
    } catch (error) {
      console.error(`   ❌ Connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get active page
   */
  async getActivePage() {
    if (!this.browser) return null;
    
    const pages = await this.browser.pages();
    // Try to find the active tab (usually the last one)
    return pages[pages.length - 1] || pages[0] || null;
  }

  /**
   * Fill form field
   */
  async fillField(selector, value) {
    if (!this.currentPage) {
      this.currentPage = await this.getActivePage();
    }
    
    if (!this.currentPage) {
      return { success: false, error: 'No active page found' };
    }

    try {
      await this.currentPage.waitForSelector(selector, { timeout: 5000 });
      await this.currentPage.type(selector, value, { delay: 50 });
      return { success: true };
    } catch (error) {
      // Try alternative selectors
      try {
        await this.currentPage.evaluate((sel, val) => {
          const input = document.querySelector(sel) || 
                       document.querySelector(`input[name*="${sel}"]`) ||
                       document.querySelector(`input[id*="${sel}"]`) ||
                       document.querySelector(`input[placeholder*="${sel}"]`);
          if (input) {
            input.value = val;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, selector, value);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  }

  /**
   * Click element
   */
  async clickElement(selector) {
    if (!this.currentPage) {
      this.currentPage = await this.getActivePage();
    }
    
    if (!this.currentPage) {
      return { success: false, error: 'No active page found' };
    }

    try {
      await this.currentPage.waitForSelector(selector, { timeout: 5000 });
      await this.currentPage.click(selector);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to URL
   */
  async navigate(url) {
    if (!this.currentPage) {
      this.currentPage = await this.getActivePage();
    }
    
    if (!this.currentPage) {
      return { success: false, error: 'No active page found' };
    }

    try {
      await this.currentPage.goto(url, { waitUntil: 'networkidle2' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute command from AI response
   */
  async executeCommand(command) {
    console.log(`\n   🤖 Executing: ${command.action}`);
    
    switch (command.action) {
      case 'fill':
        return await this.fillField(command.selector, command.value);
      
      case 'click':
        return await this.clickElement(command.selector);
      
      case 'navigate':
        return await this.navigate(command.url);
      
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, command.duration || 1000));
        return { success: true };
      
      default:
        return { success: false, error: `Unknown action: ${command.action}` };
    }
  }

  /**
   * Process AI response and execute commands
   */
  async processAIResponse(response) {
    // Parse commands from AI response
    // Format: {action: 'fill', selector: 'input[name="email"]', value: 'test@example.com'}
    
    if (Array.isArray(response)) {
      // Multiple commands
      for (const cmd of response) {
        const result = await this.executeCommand(cmd);
        if (!result.success) {
          console.log(`   ⚠️  Command failed: ${result.error}`);
        }
      }
    } else if (response.action) {
      // Single command
      const result = await this.executeCommand(response);
      if (!result.success) {
        console.log(`   ⚠️  Command failed: ${result.error}`);
      }
    }
  }

  /**
   * Start ghost bot
   */
  async start() {
    if (this.isActive) {
      console.log('   ⚠️  Ghost bot is already active');
      return;
    }

    console.log('   🚀 Starting Ghost Bot...');
    const connected = await this.connect();
    
    if (!connected) {
      console.log('   ❌ Failed to connect to browser');
      console.log('   💡 Make sure Chrome is running with remote debugging:');
      console.log('      chrome.exe --remote-debugging-port=9222\n');
      return;
    }

    this.isActive = true;
    this.currentPage = await this.getActivePage();
    console.log('   ✅ Ghost Bot is now ACTIVE\n');
  }

  /**
   * Stop ghost bot
   */
  async stop() {
    if (!this.isActive) {
      console.log('   ⚠️  Ghost Bot is not active');
      return;
    }

    console.log('   🛑 Stopping Ghost Bot...');
    // Don't close browser - it's the user's browser!
    this.browser = null;
    this.currentPage = null;
    this.isActive = false;
    console.log('   ✅ Ghost Bot is now INACTIVE\n');
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      hasBrowser: this.browser !== null,
      currentUrl: this.currentPage?.url() || null
    };
  }
}

// Global launcher instance
const launcher = new GhostBotLauncher();

/**
 * Show menu
 */
function showMenu() {
  console.log('\n' + '='.repeat(50));
  console.log('👻 GHOST BOT LAUNCHER');
  console.log('='.repeat(50));
  console.log('\nCommands:');
  console.log('  start          - Start the ghost bot');
  console.log('  stop           - Stop the ghost bot');
  console.log('  status         - Check ghost bot status');
  console.log('  ask <question> - Ask a question (AI will answer and bot will execute)');
  console.log('  fill <field> <value> - Fill a form field');
  console.log('  click <selector> - Click an element');
  console.log('  navigate <url> - Navigate to URL');
  console.log('  help           - Show this menu');
  console.log('  exit           - Exit launcher\n');
}

/**
 * Ask question to AI (simulated - in real use, this would call the AI)
 */
async function askAI(question) {
  // This is where you'd integrate with the AI
  // For now, we'll parse common questions and return commands
  
  const lowerQuestion = question.toLowerCase();
  
  // Amazon Associates signup
  if (lowerQuestion.includes('amazon') && lowerQuestion.includes('website')) {
    return [{
      action: 'fill',
      selector: 'input[name*="website"], input[name*="url"]',
      value: 'https://ggloop.io'
    }];
  }
  
  if (lowerQuestion.includes('amazon') && lowerQuestion.includes('business')) {
    return [{
      action: 'fill',
      selector: 'input[name*="business"], input[name*="company"]',
      value: 'GG LOOP LLC'
    }];
  }
  
  if (lowerQuestion.includes('amazon') && lowerQuestion.includes('email')) {
    return [{
      action: 'fill',
      selector: 'input[type="email"], input[name*="email"]',
      value: 'jaysonquindao@ggloop.io'
    }];
  }
  
  // Generic form filling
  if (lowerQuestion.includes('fill') && lowerQuestion.includes('email')) {
    return [{
      action: 'fill',
      selector: 'input[type="email"]',
      value: 'jaysonquindao@ggloop.io'
    }];
  }
  
  // Default: return helpful message
  return {
    message: `I understand you want to: ${question}. Please provide more specific instructions like:
    - "fill website field with https://ggloop.io"
    - "click the submit button"
    - "navigate to amazon signup"`
  };
}

/**
 * Main launcher loop
 */
async function runLauncher() {
  console.log('👻 GHOST BOT LAUNCHER\n');
  console.log('Your virtual ghost assistant - toggle on/off, ask questions, get help!\n');
  
  showMenu();
  
  const askQuestion = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  while (true) {
    const command = await askQuestion('👻 Ghost Bot > ');
    
    if (!command) continue;
    
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'start':
        await launcher.start();
        break;
      
      case 'stop':
        await launcher.stop();
        break;
      
      case 'status':
        const status = launcher.getStatus();
        console.log('\n   📊 Ghost Bot Status:');
        console.log(`      Active: ${status.isActive ? '✅ YES' : '❌ NO'}`);
        console.log(`      Browser: ${status.hasBrowser ? '✅ Connected' : '❌ Not connected'}`);
        console.log(`      Current URL: ${status.currentUrl || 'None'}\n`);
        break;
      
      case 'ask':
        if (!launcher.isActive) {
          console.log('   ⚠️  Ghost Bot is not active. Run "start" first.\n');
          break;
        }
        
        const question = args.join(' ');
        console.log(`\n   💬 Your question: ${question}`);
        console.log('   🤖 Processing with AI...');
        
        const aiResponse = await askAI(question);
        
        if (aiResponse.message) {
          console.log(`   💡 ${aiResponse.message}\n`);
        } else {
          console.log('   ✅ AI provided commands, executing...');
          await launcher.processAIResponse(aiResponse);
          console.log('   ✅ Done!\n');
        }
        break;
      
      case 'fill':
        if (!launcher.isActive) {
          console.log('   ⚠️  Ghost Bot is not active. Run "start" first.\n');
          break;
        }
        
        const field = args[0];
        const value = args.slice(1).join(' ');
        
        if (!field || !value) {
          console.log('   ⚠️  Usage: fill <selector> <value>\n');
          break;
        }
        
        const fillResult = await launcher.fillField(field, value);
        if (fillResult.success) {
          console.log('   ✅ Field filled!\n');
        } else {
          console.log(`   ❌ Failed: ${fillResult.error}\n`);
        }
        break;
      
      case 'click':
        if (!launcher.isActive) {
          console.log('   ⚠️  Ghost Bot is not active. Run "start" first.\n');
          break;
        }
        
        const selector = args.join(' ');
        if (!selector) {
          console.log('   ⚠️  Usage: click <selector>\n');
          break;
        }
        
        const clickResult = await launcher.clickElement(selector);
        if (clickResult.success) {
          console.log('   ✅ Clicked!\n');
        } else {
          console.log(`   ❌ Failed: ${clickResult.error}\n`);
        }
        break;
      
      case 'navigate':
        if (!launcher.isActive) {
          console.log('   ⚠️  Ghost Bot is not active. Run "start" first.\n');
          break;
        }
        
        const url = args.join(' ');
        if (!url) {
          console.log('   ⚠️  Usage: navigate <url>\n');
          break;
        }
        
        const navResult = await launcher.navigate(url);
        if (navResult.success) {
          console.log('   ✅ Navigated!\n');
        } else {
          console.log(`   ❌ Failed: ${navResult.error}\n`);
        }
        break;
      
      case 'help':
        showMenu();
        break;
      
      case 'exit':
      case 'quit':
        console.log('\n   👋 Goodbye!\n');
        rl.close();
        process.exit(0);
        break;
      
      default:
        console.log(`   ⚠️  Unknown command: ${cmd}`);
        console.log('   Type "help" for available commands\n');
    }
  }
}

// Run launcher
runLauncher().catch(console.error);

