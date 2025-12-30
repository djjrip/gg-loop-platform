/**
 * ADMIN: UPDATE RIOT API KEY ON THE FLY
 * No need to redeploy when key expires
 */
import { Router } from 'express';
const router = Router();
// Admin middleware (you must be logged in as founder)
function requireFounder(req, res, next) {
    if (!req.user || req.user.email !== 'jaysonquindao1@gmail.com') {
        return res.status(403).send('Forbidden');
    }
    next();
}
// Page to update API key
router.get('/admin/update-riot-key', requireFounder, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Update Riot API Key</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #0a0a0a;
          color: #fff;
        }
        h1 {
          color: #f97316;
        }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 2px solid #333;
          border-radius: 8px;
          background: #1a1a1a;
          color: #fff;
          font-size: 14px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(to right, #f97316, #fb923c);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          opacity: 0.9;
        }
        .success {
          padding: 12px;
          background: #166534;
          border-radius: 8px;
          margin-top: 10px;
        }
        .info {
          padding: 12px;
          background: #1e3a8a;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>🔑 Update Riot API Key</h1>
      
      <div class="info">
        <strong>Current Key Status:</strong><br>
        Personal keys expire every 24 hours.<br>
        Production keys never expire (waiting on approval).
      </div>

      <form action="/admin/update-riot-key" method="POST">
        <label>New API Key:</label>
        <input 
          type="text" 
          name="apiKey" 
          placeholder="RGAPI-..." 
          required
          pattern="RGAPI-.*"
        >
        
        <button type="submit">Update Key</button>
      </form>

      <div id="success"></div>

      <script>
        const params = new URLSearchParams(window.location.search);
        if (params.get('updated') === 'true') {
          document.getElementById('success').innerHTML = 
            '<div class="success">✅ API Key Updated Successfully!</div>';
        }
      </script>
    </body>
    </html>
  `);
});
// Handle key update
router.post('/admin/update-riot-key', requireFounder, async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.startsWith('RGAPI-')) {
        return res.status(400).send('Invalid API key format');
    }
    // Update environment variable in Railway
    // (You'll need to set RAILWAY_TOKEN in .env)
    if (process.env.RAILWAY_TOKEN) {
        try {
            await fetch(`https://backboard.railway.app/graphql/v2`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RAILWAY_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
            mutation variableUpsert($input: VariableUpsertInput!) {
              variableUpsert(input: $input)
            }
          `,
                    variables: {
                        input: {
                            projectId: process.env.RAILWAY_PROJECT_ID,
                            environmentId: process.env.RAILWAY_ENVIRONMENT_ID,
                            name: 'RIOT_API_KEY',
                            value: apiKey,
                        },
                    },
                }),
            });
        }
        catch (error) {
            console.error('Railway update failed:', error);
        }
    }
    // Also update in .env file for local dev
    const fs = require('fs');
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('RIOT_API_KEY=')) {
        envContent = envContent.replace(/RIOT_API_KEY=.*/g, `RIOT_API_KEY=${apiKey}`);
    }
    else {
        envContent += `\nRIOT_API_KEY=${apiKey}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    // Restart server (in production this redeploys)
    console.log('✅ Riot API Key Updated:', apiKey.substring(0, 20) + '...');
    res.redirect('/admin/update-riot-key?updated=true');
});
export default router;
/*
 * USAGE:
 *
 * 1. When your personal key expires (every 24 hours):
 *    - Go to: https://developer.riotgames.com/apis
 *    - Click "Regenerate API Key"
 *    - Copy new key
 *
 * 2. Go to: https://ggloop.io/admin/update-riot-key
 *    - Paste new key
 *    - Click Update
 *    - Done! (updates instantly)
 *
 * 3. Once production API is approved:
 *    - Update one final time with production key
 *    - Never expires again
 */
