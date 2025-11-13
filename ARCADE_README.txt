GG LOOP ARCADE v1 - Setup Instructions
======================================

This is the clean, simple demo focusing on the core loop: wins → points → rewards → leaderboard

STEP 1: Create a new Repl
--------------------------
1. Go to Replit.com
2. Click "+ Create Repl"
3. Choose "Node.js" template
4. Name it: "GG-LOOP-ARCADE-V1"
5. Click "Create Repl"

STEP 2: Copy these files to your new Repl
-------------------------------------------
Create these files with the exact contents:

1. package.json (from arcade-package.json below)
2. server.js (copy arcade-server.js)
3. config.json (already created)
4. index.html (copy arcade-index.html)
5. dashboard.html (copy arcade-dashboard.html)
6. profit.html (copy arcade-profit.html)

STEP 3: Install and run
------------------------
In the new Repl shell, run:

  npm install
  npm start

Then open:
- / → Landing page
- /dashboard.html → Main demo dashboard
- /profit.html → Profit calculator

PACKAGE.JSON CONTENTS:
{
  "name": "ggloop-arcade-v1",
  "version": "1.0.0",
  "description": "GG LOOP core loop demo for Replit",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "@replit/database": "^2.0.0",
    "node-fetch": "^3.3.2"
  }
}

FILES CREATED IN THIS REPL:
- config.json → Already here
- arcade-server.js → Rename to server.js
- arcade-index.html → Rename to index.html
- arcade-dashboard.html → Rename to dashboard.html
- arcade-profit.html → Rename to profit.html
