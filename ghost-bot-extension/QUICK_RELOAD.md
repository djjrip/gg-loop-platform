# 🔄 QUICK RELOAD GUIDE

**Chrome extensions don't auto-update!** You need to manually reload after each change.

---

## ⚡ FASTEST WAY

1. **Make changes** → Edit files in `ghost-bot-extension/`
2. **Save files** → Ctrl+S
3. **Go to** → `chrome://extensions/`
4. **Find** → "Ghost Bot - Virtual Assistant"
5. **Click** → Refresh icon (🔄)
6. **Test** → Click Ghost Bot icon in toolbar

**That's it!** Takes 5 seconds. ✅

---

## 🚀 USE THE HELPER SCRIPT

```powershell
npm run ghost:reload
```

This opens `chrome://extensions/` for you!

---

## 💡 PRO TIP

**Keep `chrome://extensions/` open in a tab while developing!**

Then you just:
1. Make changes
2. Click refresh
3. Test

---

## 🔍 HOW TO KNOW IT UPDATED

**Check the version number:**
- Look at "Ghost Bot v1.0.2" in the popup header
- If you see the new version, it updated! ✅

---

## ⚠️ WHY THIS HAPPENS

Chrome extensions are **packaged** for security. Chrome doesn't watch your local files - you need to manually reload.

**This is normal!** All Chrome extension developers do this. ✅

---

## 📝 AFTER RELOADING

- Extension state resets (normal)
- Any open popups close (normal)
- Click the icon again to test (normal)

**Everything is working correctly!** ✅

