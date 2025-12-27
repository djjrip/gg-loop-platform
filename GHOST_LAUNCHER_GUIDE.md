# 🚀 GHOST BOT LAUNCHER

**Toggle on/off, ask questions, get help - all in one place!**

---

## 🎯 QUICK START

### **Launch the Ghost Bot:**
```powershell
npm run ghost:launch
```

**Then use these commands:**
- `start` - Turn ghost bot ON
- `stop` - Turn ghost bot OFF
- `ask <question>` - Ask me a question, I'll answer and the bot will execute
- `status` - Check if ghost bot is active
- `help` - Show all commands

---

## 💬 HOW IT WORKS

### **1. Start the Launcher:**
```powershell
npm run ghost:launch
```

### **2. Start the Ghost Bot:**
```
👻 Ghost Bot > start
```

### **3. Ask Questions:**
```
👻 Ghost Bot > ask fill website field for amazon signup
```

**What happens:**
1. ✅ You ask the question
2. ✅ I (the AI) process it and provide commands
3. ✅ Ghost bot executes the commands in your browser
4. ✅ Fields get filled automatically!

---

## 📋 AVAILABLE COMMANDS

| Command | What It Does |
|---------|-------------|
| `start` | Turn ghost bot ON (connects to your browser) |
| `stop` | Turn ghost bot OFF (disconnects) |
| `status` | Check if ghost bot is active |
| `ask <question>` | Ask me a question, I'll answer and bot executes |
| `fill <selector> <value>` | Fill a form field directly |
| `click <selector>` | Click an element |
| `navigate <url>` | Navigate to a URL |
| `help` | Show all commands |
| `exit` | Exit the launcher |

---

## 💡 EXAMPLE USAGE

### **Example 1: Amazon Associates Signup**
```
👻 Ghost Bot > start
👻 Ghost Bot > ask fill website field for amazon
👻 Ghost Bot > ask fill business name for amazon
👻 Ghost Bot > ask fill email for amazon
```

**Result:** All non-private fields get filled automatically!

### **Example 2: Direct Commands**
```
👻 Ghost Bot > start
👻 Ghost Bot > navigate https://affiliate-program.amazon.com/signup
👻 Ghost Bot > fill input[name="website"] https://ggloop.io
👻 Ghost Bot > click button[type="submit"]
```

### **Example 3: Check Status**
```
👻 Ghost Bot > status
```

**Output:**
```
📊 Ghost Bot Status:
   Active: ✅ YES
   Browser: ✅ Connected
   Current URL: https://affiliate-program.amazon.com/signup
```

---

## 🔒 PRIVACY & SECURITY

### **What the Ghost Bot DOES:**
- ✅ Connects to your existing browser (no new windows!)
- ✅ Fills public information (website, business name, email)
- ✅ Clicks buttons and navigates
- ✅ Executes commands you ask for

### **What the Ghost Bot DOESN'T:**
- ❌ Enter passwords (stops and waits for you)
- ❌ Enter payment information (stops and waits)
- ❌ Enter tax information (stops and waits)
- ❌ Access private data without permission

### **When It Stops:**
- 🔒 **Password fields** → You fill manually
- 🔒 **Payment info** → You fill manually
- 🔒 **Tax info** → You fill manually
- 🔒 **CAPTCHA** → You solve manually

---

## 🎯 ASK QUESTIONS

You can ask me questions in natural language:

### **Good Questions:**
- `ask fill website field for amazon signup`
- `ask fill business name for amazon`
- `ask fill email for amazon`
- `ask click the submit button`
- `ask navigate to amazon associates`

### **I'll Process:**
1. Understand what you want
2. Generate the right commands
3. Ghost bot executes them automatically
4. You see the results in real-time!

---

## 🚀 GET STARTED

```powershell
npm run ghost:launch
```

**Then:**
```
👻 Ghost Bot > start
👻 Ghost Bot > ask help me with amazon signup
```

**Your virtual ghost assistant is ready!** 👻

---

## 💡 TIPS

1. **Always start first:** Run `start` before asking questions
2. **Be specific:** "fill website field" is better than "fill form"
3. **Check status:** Use `status` to see what's happening
4. **Stop when done:** Run `stop` when you're finished

---

## 🔄 WORKFLOW

1. **Launch:** `npm run ghost:launch`
2. **Start:** `start`
3. **Ask:** `ask <your question>`
4. **Watch:** Ghost bot executes automatically
5. **Stop:** `stop` when done
6. **Exit:** `exit`

**That's it! Your virtual ghost assistant handles the rest!** 🚀

