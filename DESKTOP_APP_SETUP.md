# 🖥️ GHOST BOT DESKTOP APP SETUP

**Pin it to your desktop and taskbar!**

---

## 🚀 QUICK SETUP

### **Option 1: Create Desktop Shortcut (Easiest)**

Run this in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1
```

**That's it!** You'll see "Ghost Bot Launcher" on your desktop.

---

### **Option 2: Manual Desktop Shortcut**

1. **Right-click on your desktop** → New → Shortcut
2. **Location:** Browse to this folder and select `GhostBotLauncher.bat`
3. **Name it:** "Ghost Bot Launcher"
4. **Right-click the shortcut** → Properties → Change Icon (optional)
5. **Pin to taskbar:** Right-click shortcut → Pin to taskbar

---

## 📌 PIN TO TASKBAR

1. **Double-click** the desktop shortcut
2. **Right-click** the running window in taskbar
3. **Click** "Pin to taskbar"

**Now you can launch it with one click!**

---

## 🎯 HOW TO USE

1. **Double-click** "Ghost Bot Launcher" on desktop
2. **Wait** for it to connect to your browser
3. **Start asking questions:**
   ```
   ask fill website field
   ask fill all non-private fields
   ask click submit button
   ```

---

## 🔧 TROUBLESHOOTING

### **If it doesn't start:**
1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Make sure Chrome is running

### **If Chrome connection fails:**
1. Close all Chrome windows
2. Open PowerShell and run:
   ```powershell
   Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222"
   ```
3. Then launch Ghost Bot again

---

## 💡 TIP

**Pin it to your taskbar for quick access!**

1. Launch Ghost Bot
2. Right-click the window in taskbar
3. Click "Pin to taskbar"
4. Now you can launch it anytime with one click!

---

## 🎉 THAT'S IT!

**You now have a desktop app you can pin anywhere!**

Just double-click and start asking questions! 👻

