// Ghost Bot - Cursor AI Integration
// Allows Cursor to delegate tasks and track what Ghost Bot is doing

class CursorIntegration {
  constructor() {
    this.taskQueue = [];
    this.completedTasks = [];
    this.statusFile = 'ghost-bot-status.json';
    this.tasksFile = 'ghost-bot-tasks.json';
  }

  // Load tasks from Cursor
  async loadTasksFromCursor() {
    try {
      // Check for tasks file created by Cursor
      const response = await fetch(`http://localhost:3001/api/ghost-bot/tasks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        return data.tasks || [];
      }

      // Fallback: Check local storage
      const stored = localStorage.getItem('cursorTasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks from Cursor:', error);
      return [];
    }
  }

  // Report status back to Cursor
  async reportToCursor(status) {
    try {
      // Send status to Cursor API
      await fetch(`http://localhost:3001/api/ghost-bot/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          status: status,
          currentTab: await this.getCurrentTabInfo()
        })
      }).catch(() => null);

      // Also save to local storage for backup
      localStorage.setItem('cursorStatus', JSON.stringify(status));
    } catch (error) {
      console.error('Error reporting to Cursor:', error);
    }
  }

  // Get current tab info
  async getCurrentTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return {
        url: tab.url,
        title: tab.title,
        id: tab.id
      };
    } catch (error) {
      return null;
    }
  }

  // Execute task from Cursor
  async executeTask(task) {
    console.log('Executing task from Cursor:', task);
    
    await this.reportToCursor({
      type: 'task_started',
      task: task,
      message: `Starting task: ${task.action}`
    });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      let result = null;
      
      switch (task.action) {
        case 'fill_field':
          result = await chrome.tabs.sendMessage(tab.id, {
            action: 'fill',
            field: task.field,
            value: task.value
          });
          break;
        
        case 'fill_all_safe':
          result = await chrome.tabs.sendMessage(tab.id, {
            action: 'fill_all_safe'
          });
          break;
        
        case 'click':
          result = await chrome.tabs.sendMessage(tab.id, {
            action: 'click',
            selector: task.selector
          });
          break;
        
        case 'navigate':
          await chrome.tabs.update(tab.id, { url: task.url });
          result = { success: true, message: `Navigated to ${task.url}` };
          break;
        
        case 'analyze':
          result = await chrome.tabs.sendMessage(tab.id, {
            action: 'analyze'
          });
          break;
        
        default:
          result = { success: false, error: `Unknown action: ${task.action}` };
      }

      await this.reportToCursor({
        type: 'task_completed',
        task: task,
        result: result,
        message: `Completed: ${task.action}`
      });

      return result;
    } catch (error) {
      await this.reportToCursor({
        type: 'task_failed',
        task: task,
        error: error.message,
        message: `Failed: ${task.action} - ${error.message}`
      });
      
      throw error;
    }
  }

  // Check for new tasks periodically
  async checkForTasks() {
    const tasks = await this.loadTasksFromCursor();
    
    for (const task of tasks) {
      if (!this.completedTasks.includes(task.id)) {
        await this.executeTask(task);
        this.completedTasks.push(task.id);
      }
    }
  }

  // Start monitoring for Cursor tasks
  startMonitoring() {
    // Check every 2 seconds for new tasks
    setInterval(() => {
      this.checkForTasks();
    }, 2000);

    // Report initial status
    this.reportToCursor({
      type: 'ghost_bot_ready',
      message: 'Ghost Bot is ready and connected to Cursor',
      timestamp: new Date().toISOString()
    });
  }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CursorIntegration;
}

