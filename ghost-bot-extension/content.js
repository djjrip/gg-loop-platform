// Ghost Bot Extension - Content Script
// High-level automation with visual feedback

// Load visual feedback
let visualFeedback = null;
try {
  // Inject visual feedback if available
  if (typeof VisualFeedback !== 'undefined') {
    visualFeedback = new VisualFeedback();
  }
} catch (e) {
  // Visual feedback not available, continue without it
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    analyzePage().then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getPageDetails') {
    getPageDetails().then(sendResponse);
    return true;
  }
  
  if (request.action === 'ask') {
    handleQuestion(request.question).then(sendResponse);
    return true;
  }
  
  if (request.action === 'fill') {
    const { field, value } = request;
    const filled = fillField(field, value);
    sendResponse({ success: filled });
    return true;
  }
  
  if (request.action === 'fill_all_safe') {
    const fillableFields = {
      website: { value: 'https://ggloop.io', selectors: ['website', 'url', 'site'] },
      business: { value: 'GG LOOP LLC', selectors: ['business', 'company'] },
      email: { value: 'jaysonquindao@ggloop.io', selectors: ['email', 'mail'] },
    };
    
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const filled = [];
    
    for (const input of inputs) {
      if (input.type === 'password' || input.type === 'hidden' || input.value) continue;
      
      const inputName = (input.name || input.id || '').toLowerCase();
      for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
        if (fieldData.selectors.some(sel => inputName.includes(sel))) {
          input.value = fieldData.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filled.push(fieldName);
          break;
        }
      }
    }
    
    sendResponse({ success: true, filled });
    return true;
  }
  
  if (request.action === 'click') {
    const { selector } = request;
    let button = document.querySelector(selector);
    
    if (!button) {
      // Try to find by text
      const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
      button = buttons.find(b => {
        const text = b.textContent?.toLowerCase() || '';
        return text.includes(selector.toLowerCase());
      });
    }
    
    if (button) {
      button.click();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Button not found' });
    }
    return true;
  }
});

// Get detailed page information
async function getPageDetails() {
  const text = document.body.innerText.substring(0, 500);
  const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent).slice(0, 5);
  const links = Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
    text: a.textContent?.substring(0, 30),
    href: a.href
  }));
  
  return {
    textPreview: text,
    headings: headings,
    links: links,
    hasForms: document.querySelectorAll('form, input, textarea').length > 0
  };
}

// Analyze current page
async function analyzePage() {
  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
  
  const fields = inputs.map(input => ({
    type: input.type || input.tagName.toLowerCase(),
    name: input.name || input.id || input.placeholder || 'unnamed',
    value: input.value,
    required: input.required,
    isPrivate: input.type === 'password' || 
               (input.name?.toLowerCase().includes('password')) ||
               (input.name?.toLowerCase().includes('ssn')) ||
               (input.name?.toLowerCase().includes('credit'))
  }));
  
  return {
    url: window.location.href,
    title: document.title,
    fields: fields,
    hasForms: fields.length > 0
  };
}

// Fill a specific field
function fillField(selector, value) {
  try {
    const input = document.querySelector(selector);
    if (!input) {
      // Try alternative selectors
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const matching = inputs.find(inp => {
        const name = (inp.name || inp.id || inp.placeholder || '').toLowerCase();
        const sel = selector.toLowerCase();
        return name.includes(sel) || sel.includes(name);
      });
      
      if (matching) {
        matching.value = value;
        matching.dispatchEvent(new Event('input', { bubbles: true }));
        matching.dispatchEvent(new Event('change', { bubbles: true }));
        matching.focus();
        matching.blur();
        return true;
      }
      return false;
    }
    
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  } catch (error) {
    console.error('Error filling field:', error);
    return false;
  }
}

// Handle question from user
async function handleQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  const commands = [];
  
  // Get page info
  const pageInfo = await analyzePage();
  
  // Smart field detection and filling
  const fillableFields = {
    website: { value: 'https://ggloop.io', selectors: ['website', 'url', 'site', 'domain', 'web', 'enter your website'] },
    url: { value: 'https://ggloop.io', selectors: ['url', 'website', 'site', 'domain', 'enter your website'] },
    business: { value: 'GG LOOP LLC', selectors: ['business', 'company', 'organization', 'org', 'firm'] },
    'business name': { value: 'GG LOOP LLC', selectors: ['business', 'company', 'name'] },
    email: { value: 'jaysonquindao@ggloop.io', selectors: ['email', 'e-mail', 'mail', 'e mail'] },
    description: { value: 'Competitive gaming rewards platform where players earn points and redeem for rewards', selectors: ['description', 'about', 'summary', 'describe'] },
  };
  
  // Special handling for Amazon Associates form
  if (window.location.href.includes('amazon.com') || window.location.href.includes('affiliate-program.amazon.com')) {
    // Find website input fields more aggressively for Amazon
    const allInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="url"], textarea'));
    for (const input of allInputs) {
      const label = input.closest('div')?.querySelector('label')?.textContent?.toLowerCase() || '';
      const placeholder = input.placeholder?.toLowerCase() || '';
      const name = (input.name || input.id || '').toLowerCase();
      
      // Check if this is a website field
      if ((label.includes('website') || label.includes('url') || placeholder.includes('website') || name.includes('website')) && !input.value) {
        if (lowerQuestion.includes('fill') || lowerQuestion.includes('website') || lowerQuestion.includes('url')) {
          input.focus();
          input.value = 'https://ggloop.io';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          commands.push(`✅ Filled website field with https://ggloop.io`);
        }
      }
    }
  }
  
  // Fill fields based on question
  for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
    if (lowerQuestion.includes(fieldName) || 
        fieldData.selectors.some(sel => lowerQuestion.includes(sel))) {
      
      // Find matching input
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const matchingInput = inputs.find(input => {
        if (input.type === 'password' || input.type === 'hidden') return false;
        const inputName = (input.name || input.id || input.placeholder || '').toLowerCase();
        return fieldData.selectors.some(sel => inputName.includes(sel)) && !input.value;
      });
      
      if (matchingInput) {
        // Show visual feedback
        if (visualFeedback) {
          visualFeedback.highlightField(`input[name*="${matchingInput.name}"], input[id*="${matchingInput.id}"]`);
        }
        
        matchingInput.focus();
        matchingInput.value = fieldData.value;
        matchingInput.dispatchEvent(new Event('input', { bubbles: true }));
        matchingInput.dispatchEvent(new Event('change', { bubbles: true }));
        matchingInput.dispatchEvent(new Event('blur', { bubbles: true }));
        commands.push(`✅ Filled ${matchingInput.name || matchingInput.id || 'field'} with ${fieldData.value}`);
      }
    }
  }
  
  // Auto-fill all non-private fields
  if (lowerQuestion.includes('fill all') || lowerQuestion.includes('fill everything') || lowerQuestion.includes('fill what you can')) {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    let filledCount = 0;
    
    for (const input of inputs) {
      if (input.type === 'password' || input.type === 'hidden' || input.value) continue;
      
      const inputName = (input.name || input.id || input.placeholder || '').toLowerCase();
      
      // Try to match with fillable fields
      for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
        if (fieldData.selectors.some(sel => inputName.includes(sel))) {
          input.focus();
          input.value = fieldData.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          commands.push(`✅ Filled ${input.name || input.id || 'field'}`);
          filledCount++;
          break;
        }
      }
    }
    
    if (filledCount === 0) {
      commands.push('No fillable fields found');
    }
  }
  
  // Click buttons
  if (lowerQuestion.includes('click') || lowerQuestion.includes('press') || lowerQuestion.includes('submit')) {
    let button = null;
    
    if (lowerQuestion.includes('submit')) {
      button = document.querySelector('button[type="submit"], input[type="submit"], button:contains("submit"), button:contains("Submit")');
    } else if (lowerQuestion.includes('continue') || lowerQuestion.includes('next')) {
      const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"]'));
      button = buttons.find(b => {
        const text = b.textContent?.toLowerCase() || '';
        return text.includes('continue') || text.includes('next');
      });
    } else {
      button = document.querySelector('button[type="submit"]');
    }
    
    if (button) {
      button.click();
      commands.push('✅ Clicked button');
    } else {
      commands.push('❌ Button not found');
    }
  }
  
  return {
    success: commands.length > 0,
    message: commands.length > 0 ? commands.join(', ') : 'No actions taken. Try: "fill website field" or "fill all non-private fields"',
    commands: commands
  };
}

// Handle direct fill action
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fill') {
    const { field, value } = request;
    const filled = fillField(field, value);
    sendResponse({ success: filled });
    return true;
  }
  
  if (request.action === 'fill_all_safe') {
    const pageInfo = analyzePage();
    const fillableFields = {
      website: { value: 'https://ggloop.io', selectors: ['website', 'url', 'site', 'enter your website'] },
      business: { value: 'GG LOOP LLC', selectors: ['business', 'company'] },
      email: { value: 'jaysonquindao@ggloop.io', selectors: ['email', 'mail'] },
    };
    
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const filled = [];
    
    // Special handling for Amazon Associates
    if (window.location.href.includes('amazon.com') || window.location.href.includes('affiliate-program.amazon.com')) {
      const websiteInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="url"]'));
      for (const input of websiteInputs) {
        const label = input.closest('div')?.querySelector('label')?.textContent?.toLowerCase() || '';
        const placeholder = input.placeholder?.toLowerCase() || '';
        const name = (input.name || input.id || '').toLowerCase();
        if ((label.includes('website') || placeholder.includes('website') || name.includes('website')) && !input.value) {
          input.value = 'https://ggloop.io';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filled.push('website');
        }
      }
    }
    
    for (const input of inputs) {
      if (input.type === 'password' || input.type === 'hidden' || input.value) continue;
      
      const inputName = (input.name || input.id || '').toLowerCase();
      for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
        if (fieldData.selectors.some(sel => inputName.includes(sel))) {
          input.value = fieldData.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filled.push(fieldName);
          break;
        }
      }
    }
    
    sendResponse({ success: true, filled });
    return true;
  }
  
  if (request.action === 'click') {
    const { selector } = request;
    const button = document.querySelector(selector);
    if (button) {
      button.click();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Button not found' });
    }
    return true;
  }
});

