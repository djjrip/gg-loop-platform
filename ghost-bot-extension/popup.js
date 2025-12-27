// Ghost Bot Extension - Conversational AI Chat with Cursor Integration

let conversationHistory = [];
let currentTab = null;
let cursorIntegration = null;

// Load Cursor Integration
let CursorIntegration;
try {
  // Try to load as module
  const module = await import('./cursor-integration.js');
  CursorIntegration = module.CursorIntegration || module.default;
} catch (e) {
  // Fallback: define inline
  CursorIntegration = class {
    async reportToCursor() {}
    startMonitoring() {}
  };
}

// Initialize
async function init() {
  await loadCurrentTab();
  setupEventListeners();
  
  // Initialize Cursor integration (if available)
  try {
    if (typeof CursorIntegration !== 'undefined') {
      cursorIntegration = new CursorIntegration();
      if (cursorIntegration.startMonitoring) {
        cursorIntegration.startMonitoring();
      }
      
      // Report to Cursor that Ghost Bot is ready
      if (cursorIntegration.reportToCursor) {
        await cursorIntegration.reportToCursor({
          type: 'ghost_bot_ready',
          message: 'Ghost Bot extension loaded and ready',
          tab: currentTab
        });
      }
    }
  } catch (error) {
    console.log('Cursor integration not available:', error);
  }
}

// Load current tab info
async function loadCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    document.getElementById('tabInfo').textContent = tab.title?.substring(0, 30) || 'Ready to help!';
  } catch (error) {
    console.error('Error loading tab:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const input = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  
  // Auto-resize textarea
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });
  
  // Send on Enter (but allow Shift+Enter for new line)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Send button
  sendBtn.addEventListener('click', sendMessage);
}

// Add message to chat
function addMessage(text, isUser = false, actions = []) {
  const chatContainer = document.getElementById('chatContainer');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'ghost'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = isUser ? '👤' : '👻';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = text;
  
  if (actions.length > 0) {
    actions.forEach(action => {
      const badge = document.createElement('div');
      badge.className = 'action-badge';
      badge.textContent = `✅ ${action}`;
      content.appendChild(badge);
    });
  }
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  chatContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  return messageDiv;
}

// Show typing indicator
function showTyping() {
  const chatContainer = document.getElementById('chatContainer');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator active';
  typingDiv.id = 'typingIndicator';
  
  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    dots.appendChild(dot);
  }
  typingDiv.appendChild(dots);
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

// Send message
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addMessage(message, true);
  conversationHistory.push({ role: 'user', content: message });
  
  // Clear input
  input.value = '';
  input.style.height = 'auto';
  
  // Disable input
  input.disabled = true;
  sendBtn.disabled = true;
  
  // Show typing
  showTyping();
  
  try {
    // Get AI response
    const response = await getAIResponse(message);
    
    // Hide typing
    hideTyping();
    
    // Add ghost response
    addMessage(response.text, false, response.actions || []);
    conversationHistory.push({ role: 'assistant', content: response.text });
    
    // Report to Cursor
    if (cursorIntegration) {
      await cursorIntegration.reportToCursor({
        type: 'conversation',
        userMessage: message,
        ghostResponse: response.text,
        actions: response.actions || [],
        tab: currentTab
      });
    }
    
    // Update tab info if needed
    if (response.tabInfo) {
      document.getElementById('tabInfo').textContent = response.tabInfo;
    }
    
  } catch (error) {
    hideTyping();
    addMessage(`Oops! Something went wrong: ${error.message}. Can you try again?`, false);
  } finally {
    // Re-enable input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

// Get AI response (conversational)
async function getAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Analyze page first
  let pageInfo = null;
  try {
    if (currentTab) {
      pageInfo = await chrome.tabs.sendMessage(currentTab.id, { action: 'analyze' });
    }
  } catch (error) {
    // Page might not have content script loaded
  }
  
  // Conversational responses
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return {
      text: `Hey there! 👋 Nice to meet you! I'm Ghost Bot, your virtual assistant. I can help you with forms, analyze pages, and automate tasks. What would you like help with?`,
      actions: []
    };
  }
  
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going')) {
    return {
      text: `I'm doing great, thanks for asking! 👻 I'm here and ready to help you with whatever you need. What can I do for you today?`,
      actions: []
    };
  }
  
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('help')) {
    return {
      text: `I can do lots of things! Here's what I'm good at:<br><br>
      • Fill forms automatically (website, business name, email, etc.)<br>
      • Analyze the current page and tell you what's on it<br>
      • Click buttons and navigate pages<br>
      • Have a conversation and help you with tasks<br><br>
      Just tell me what you need in plain English, and I'll help! What would you like to do?`,
      actions: []
    };
  }
  
  if (lowerMessage.includes('analyze') || lowerMessage.includes('what\'s on this page') || lowerMessage.includes('what is this page') || lowerMessage.includes('check') || lowerMessage.includes('see') || lowerMessage.includes('browser') || lowerMessage.includes('current tab')) {
    // Force analyze the page
    try {
      if (currentTab) {
        pageInfo = await chrome.tabs.sendMessage(currentTab.id, { action: 'analyze' });
      }
    } catch (error) {
      // Content script might not be loaded, try to inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['content.js']
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        pageInfo = await chrome.tabs.sendMessage(currentTab.id, { action: 'analyze' });
      } catch (e) {
        // Still failed
      }
    }
    
    if (pageInfo) {
      const fieldCount = pageInfo.fields?.length || 0;
      const privateFields = pageInfo.fields?.filter(f => f.isPrivate).length || 0;
      const fillableFields = fieldCount - privateFields;
      
      // Get more page details
      const pageDetails = await chrome.tabs.sendMessage(currentTab.id, { action: 'getPageDetails' }).catch(() => null);
      
      let detailsText = '';
      if (pageDetails) {
        detailsText = `<br>📝 <strong>Page Content:</strong> ${pageDetails.textPreview || 'Loaded'}<br>`;
      }
      
      return {
        text: `Let me check your current browser tab...<br><br>
        📄 <strong>Page:</strong> ${pageInfo.title || currentTab.title || 'Untitled'}<br>
        🔗 <strong>URL:</strong> ${pageInfo.url || currentTab.url || 'Unknown'}<br>${detailsText}
        📋 <strong>Found ${fieldCount} form field(s):</strong><br>
        • ${fillableFields} fillable fields<br>
        • ${privateFields} private fields (passwords, etc.)<br><br>
        ${fieldCount > 0 ? 'I can help fill the non-private fields for you! Just ask me to fill them.' : 'No form fields found on this page.'}`,
        actions: [],
        tabInfo: `${fieldCount} fields found`
      };
    } else {
      return {
        text: `I can see you're on: <strong>${currentTab.title || 'this page'}</strong><br>
        URL: ${currentTab.url?.substring(0, 60)}...<br><br>
        I'm having trouble analyzing the page content. Try refreshing the page and asking me again!`,
        actions: []
      };
    }
  }
  
  // Fill fields conversationally
  if (lowerMessage.includes('fill') || lowerMessage.includes('enter') || lowerMessage.includes('put')) {
    if (!pageInfo || !pageInfo.fields || pageInfo.fields.length === 0) {
      return {
        text: `I don't see any form fields on this page. Are you on a page with a form? If so, try refreshing and asking me again!`,
        actions: []
      };
    }
    
    // Execute fill action
    try {
      const result = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'ask',
        question: userMessage
      });
      
      if (result.success && result.commands && result.commands.length > 0) {
        return {
          text: `Done! ✅ I filled ${result.commands.length} field(s) for you:<br><br>${result.commands.map(c => `• ${c}`).join('<br>')}<br><br>Is there anything else you'd like me to help with?`,
          actions: result.commands
        };
      } else {
        return {
          text: `I tried to fill the fields, but I'm not sure which ones you meant. Can you be more specific? For example, you could say "fill the website field" or "fill all the fields you can".`,
          actions: []
        };
      }
    } catch (error) {
      return {
        text: `Hmm, I had trouble filling those fields. Can you tell me which specific fields you want me to fill?`,
        actions: []
      };
    }
  }
  
  // Click buttons
  if (lowerMessage.includes('click') || lowerMessage.includes('press') || lowerMessage.includes('submit')) {
    try {
      const result = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'ask',
        question: userMessage
      });
      
      if (result.success) {
        return {
          text: `✅ Done! I clicked that for you. Did it work?`,
          actions: ['Clicked button']
        };
      } else {
        return {
          text: `I couldn't find that button. Can you describe it differently? For example, "click the submit button" or "click continue".`,
          actions: []
        };
      }
    } catch (error) {
      return {
        text: `I had trouble finding that button. Can you be more specific about which button you want me to click?`,
        actions: []
      };
    }
  }
  
  // Try to understand the question better
  if (lowerMessage.includes('question') || lowerMessage.includes('answer')) {
    return {
      text: `I'm sorry I didn't answer your question properly! 😅<br><br>
      Can you ask it again? I'm here to help!<br><br>
      I can:<br>
      • Analyze your current browser tab<br>
      • Fill forms automatically<br>
      • Click buttons<br>
      • Have a conversation with you<br><br>
      What would you like me to do?`,
      actions: []
    };
  }
  
  // Default conversational response - be more helpful
  return {
    text: `I understand you're asking: "${userMessage}"<br><br>
    Let me help! I can:<br>
    • <strong>Check your current browser tab</strong> - Just say "check my browser" or "what's on this page"<br>
    • <strong>Fill forms</strong> - Say "fill website field" or "fill all fields"<br>
    • <strong>Click buttons</strong> - Say "click submit" or "click continue"<br>
    • <strong>Analyze pages</strong> - Say "analyze this page"<br><br>
    What would you like me to do right now?`,
    actions: []
  };
}

// Initialize on load
init();
