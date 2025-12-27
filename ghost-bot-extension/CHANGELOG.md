# Ghost Bot - Changelog

## Version 1.0.2 (Current)
**Date:** 2025-01-27

### 🔧 Improvements
- **Better Reload Instructions**: Added clear instructions for reloading the extension
- **Reload Helper Script**: Created PowerShell script to help with reload process
- **Version Display**: Version now loads dynamically from manifest

### 📝 Notes
- Chrome extensions require manual reload after file changes
- Use the reload helper script or follow instructions in RELOAD_INSTRUCTIONS.md

---

## Version 1.0.1
**Date:** 2025-01-27

### ✨ New Features
- **Connection Status Indicator**: Visual indicator showing if Ghost Bot is connected to Cursor
  - 🔗 Green "Connected to Cursor" when server is running
  - ⚠️ Yellow "Cursor not connected" when server is offline
- **Real-time Status Reporting**: Ghost Bot now reports its status to Cursor in real-time
- **Auto-detection**: Automatically detects server connection status

### 🔧 Improvements
- Better error handling for connection failures
- Clearer user feedback about connection state

### 📝 Notes
- Make sure to run `npm start` to enable Cursor connection
- Extension works standalone even without server connection

---

## Version 1.0.0
**Date:** 2025-01-27

### 🎉 Initial Release
- **Conversational AI Interface**: Chat naturally with Ghost Bot
- **Page Analysis**: Analyze current tab like Gemini
- **Smart Form Filling**: Automatically fill forms with business info
- **Button Clicking**: Click buttons based on natural language
- **Multi-step Workflows**: Execute complex tasks like "Complete Amazon signup"
- **Visual Feedback**: Highlights and notifications during automation
- **Cursor Integration**: Connect to Cursor for task delegation
- **Privacy Protection**: Skips private fields (passwords, credit cards)

### 🎯 Core Features
- Natural language commands
- Form field detection
- Smart automation
- Browser integration
- Task queue system

