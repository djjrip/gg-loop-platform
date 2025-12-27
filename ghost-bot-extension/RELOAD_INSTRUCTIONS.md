# 🔄 How to Auto-Reload Ghost Bot Extension

Chrome extensions **don't automatically update** when you change files. Here's how to make it easier:

---

## 🚀 Quick Method (Recommended)

### **Option 1: Use Chrome Extension Reloader**

1. **Install "Extensions Reloader" from Chrome Web Store:**
   - Search: "Extensions Reloader"
   - Install it

2. **Get your Extension ID:**
   - Go to `chrome://extensions/`
   - Find "Ghost Bot - Virtual Assistant"
   - Copy the ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

3. **Set up Auto-Reload:**
   - Click the Extensions Reloader icon
   - Add your Ghost Bot extension ID
   - Enable auto-reload

**Now it will reload automatically when files change!** ✅

---

## 🔧 Manual Method (Current)

### **Every time you make changes:**

1. **Make your changes** to files in `ghost-bot-extension/`

2. **Go to `chrome://extensions/`**

3. **Find "Ghost Bot - Virtual Assistant"**

4. **Click the refresh icon** (🔄) next to it

5. **Click the Ghost Bot icon** in your toolbar to test

---

## 🎯 Development Workflow

### **Best Practice:**

1. **Make changes** → Edit files
2. **Save files** → Ctrl+S
3. **Reload extension** → Click refresh in `chrome://extensions/`
4. **Test immediately** → Click Ghost Bot icon

### **Pro Tip:**
Keep `chrome://extensions/` open in a tab while developing!

---

## 📝 Why This Happens

Chrome extensions are **packaged** and **cached** for security and performance. Chrome doesn't watch your local files for changes - you need to manually reload or use a tool.

---

## ✅ Solution Summary

**For now:** Manually reload in `chrome://extensions/` after each change.

**Better:** Install "Extensions Reloader" Chrome extension for auto-reload.

**Future:** I can create a build script that auto-reloads, but manual reload is the standard workflow.

---

## 🚨 Important

**After reloading:**
- Your extension state resets
- Any open popups close
- You need to click the icon again to test

This is normal Chrome extension behavior! ✅

