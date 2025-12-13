# GG LOOP Discord Bot - Deployment Guide
**Date**: December 13, 2025  
**Status**: Ready for Railway Deployment

---

## 🎯 BOT FEATURES

**Slash Commands (7)**:
- `/status` - Platform status and metrics
- `/xp [user]` - Check XP and level progress
- `/rewards` - View available rewards
- `/passport` - View Passport info
- `/changelog` - Recent platform updates
- `/help` - Command list
- `/tiers` - Subscription tier info

**Auto-Posting**:
- Changelog monitoring (checks every 5 minutes)
- Welcome messages for new members
- Activity logging
- Sponsor unlock notifications

---

## 🚀 RAILWAY DEPLOYMENT

### Prerequisites
1. Discord Bot Token from https://discord.com/developers/applications
2. Railway account
3. Discord server with bot invited

### Step 1: Create Railway Project
```bash
# In discord-bot directory
railway init
railway link
```

### Step 2: Set Environment Variables
```bash
railway variables set DISCORD_BOT_TOKEN=your_token_here
railway variables set CLIENT_ID=your_client_id
railway variables set GUILD_ID=your_guild_id
railway variables set CHANGELOG_CHANNEL_ID=your_channel_id
railway variables set WELCOME_CHANNEL_ID=your_channel_id
railway variables set LOGS_CHANNEL_ID=your_channel_id
railway variables set NODE_ENV=production
```

### Step 3: Deploy
```bash
railway up
```

---

## 📋 MANUAL DEPLOYMENT STEPS

**User must complete**:
1. Create Discord application at https://discord.com/developers/applications
2. Get bot token and application ID
3. Invite bot to Discord server with permissions:
   - Send Messages
   - Embed Links
   - Use Slash Commands
   - Manage Roles (for XP-based assignment)
4. Get channel IDs from Discord (right-click channel → Copy ID)
5. Configure environment variables in Railway
6. Deploy to Railway

---

## 🔐 REQUIRED PERMISSIONS

Bot needs these Discord permissions:
- Send Messages
- Embed Links
- Use Application Commands
- Manage Roles (optional, for XP-based roles)
- Read Message History

---

## ✅ POST-DEPLOYMENT VERIFICATION

1. Check Railway logs for "✅ GG LOOP Transparency Bot is online"
2. Run `/help` in Discord to verify commands registered
3. Test each slash command
4. Verify welcome message on new member join
5. Check changelog monitoring (wait 5 minutes)

---

## 🛠️ TROUBLESHOOTING

**Bot not responding**:
- Check Railway logs for errors
- Verify DISCORD_BOT_TOKEN is correct
- Ensure bot has proper permissions

**Commands not showing**:
- Verify CLIENT_ID and GUILD_ID are correct
- Wait up to 1 hour for Discord to sync commands
- Try kicking and re-inviting bot

**Changelog not posting**:
- Verify CHANGELOG_CHANNEL_ID is set
- Check bot has Send Messages permission in that channel
- Ensure GG_LOOP_Public/CHANGELOG.md exists

---

## 📊 MONITORING

**Railway Logs**:
```bash
railway logs
```

**Bot Activity**:
- All commands logged to LOGS_CHANNEL_ID
- Changelog posts logged
- Welcome messages logged

---

**DEPLOYMENT STATUS**: ⚠️ MANUAL DEPLOYMENT REQUIRED  
**REASON**: Requires Discord bot token and Railway account access
