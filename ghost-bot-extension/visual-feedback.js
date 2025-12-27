// Visual Feedback System - Shows what Ghost Bot is doing

class VisualFeedback {
  constructor() {
    this.highlightStyle = null;
  }

  // Highlight a field being filled
  highlightField(selector, duration = 2000) {
    const element = document.querySelector(selector);
    if (!element) return;

    // Create highlight overlay
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 3px solid #4ade80;
      background: rgba(74, 222, 128, 0.2);
      pointer-events: none;
      z-index: 999999;
      animation: pulse 0.5s ease-in-out;
    `;

    // Add pulse animation
    if (!document.getElementById('ghost-bot-styles')) {
      const style = document.createElement('style');
      style.id = 'ghost-bot-styles';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(highlight);

    // Remove after duration
    setTimeout(() => {
      highlight.style.transition = 'opacity 0.3s';
      highlight.style.opacity = '0';
      setTimeout(() => highlight.remove(), 300);
    }, duration);
  }

  // Show progress indicator
  showProgress(message) {
    const progress = document.createElement('div');
    progress.id = 'ghost-bot-progress';
    progress.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    progress.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">👻</span>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(progress);

    return {
      update: (newMessage) => {
        progress.querySelector('span:last-child').textContent = newMessage;
      },
      remove: () => {
        progress.style.transition = 'opacity 0.3s';
        progress.style.opacity = '0';
        setTimeout(() => progress.remove(), 300);
      }
    };
  }

  // Show success notification
  showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4ade80;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `✅ ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Show error notification
  showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f87171;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `❌ ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

// Export
if (typeof window !== 'undefined') {
  window.GhostBotVisualFeedback = VisualFeedback;
}

