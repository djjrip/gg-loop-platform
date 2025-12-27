// Ghost Bot Extension - Content Script

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    analyzePage().then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'ask') {
    handleQuestion(request.question).then(sendResponse);
    return true;
  }
});

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

// Handle question from user
async function handleQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  const commands = [];
  
  // Get page info
  const pageInfo = await analyzePage();
  
  // Smart field detection and filling
  const fillableFields = {
    website: { value: 'https://ggloop.io', selectors: ['website', 'url', 'site', 'domain'] },
    url: { value: 'https://ggloop.io', selectors: ['url', 'website', 'site'] },
    business: { value: 'GG LOOP LLC', selectors: ['business', 'company', 'organization'] },
    email: { value: 'jaysonquindao@ggloop.io', selectors: ['email', 'e-mail', 'mail'] },
    description: { value: 'Competitive gaming rewards platform where players earn points and redeem for rewards', selectors: ['description', 'about'] },
  };
  
  // Fill fields based on question
  for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
    if (lowerQuestion.includes(fieldName) || 
        fieldData.selectors.some(sel => lowerQuestion.includes(sel))) {
      
      const matchingInput = pageInfo.fields.find(input => {
        const inputName = input.name.toLowerCase();
        return fieldData.selectors.some(sel => inputName.includes(sel)) &&
               !input.isPrivate &&
               !input.value;
      });
      
      if (matchingInput) {
        const input = document.querySelector(`input[name*="${matchingInput.name}"], input[id*="${matchingInput.name}"]`);
        if (input) {
          input.value = fieldData.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          commands.push(`Filled ${matchingInput.name} with ${fieldData.value}`);
        }
      }
    }
  }
  
  // Auto-fill all non-private fields
  if (lowerQuestion.includes('fill all') || lowerQuestion.includes('fill everything')) {
    for (const field of pageInfo.fields) {
      if (!field.isPrivate && !field.value) {
        for (const [fieldName, fieldData] of Object.entries(fillableFields)) {
          if (fieldData.selectors.some(sel => field.name.toLowerCase().includes(sel))) {
            const input = document.querySelector(`input[name*="${field.name}"], input[id*="${field.name}"]`);
            if (input) {
              input.value = fieldData.value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              commands.push(`Filled ${field.name}`);
            }
            break;
          }
        }
      }
    }
  }
  
  // Click buttons
  if (lowerQuestion.includes('click') || lowerQuestion.includes('press')) {
    let selector = 'button[type="submit"]';
    
    if (lowerQuestion.includes('submit')) {
      selector = 'button[type="submit"], input[type="submit"]';
    } else if (lowerQuestion.includes('continue') || lowerQuestion.includes('next')) {
      selector = 'button:contains("continue"), button:contains("next")';
    }
    
    const button = document.querySelector(selector);
    if (button) {
      button.click();
      commands.push('Clicked button');
    }
  }
  
  return {
    success: commands.length > 0,
    message: commands.length > 0 ? commands.join(', ') : 'No actions taken. Try: "fill website field" or "fill all non-private fields"',
    commands: commands
  };
}

