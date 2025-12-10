# GG LOOP Discord Bot

Autonomous moderation and engagement bot for the GG LOOP Discord server.

## Features

✅ **Auto-Moderation:**
- Spam detection (repeated chars, excessive links, rate limiting)
- Content filtering (banned words with 3-tier severity system)
- Automatic punishments (warn → timeout → ban)

✅ **Welcome Automation:**
- Auto-assign @Member role
- Welcome DM with server guide
- Welcome message in #welcome channel

✅ **Auto-Verification:**
- Moderators react with ✅ in #verify-access
- Bot auto-assigns @Verified role

✅ **Auto-Reactions:**
- 🎮 in #log-your-wins
- 🔥 for "clutch" or "ace"
- 💯 for "ranked up"

✅ **Admin Commands:**
- `!ban @user [reason]` - Permanent ban
- `!timeout @user <minutes> [reason]` - Temporary timeout
- `!warn @user [reason]` - Issue warning
- `!clear <number>` - Delete last N messages
- `!stats` - Show server stats

## Setup

### 1. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "GG LOOP Bot")
4. Go to "Bot" tab
5. Click "Add Bot"
6. Copy the bot token (you'll need this)
7. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent

### 2. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions:
   - Manage Roles
   - Moderate Members
   - Manage Messages
   - Read Message History
   - Send Messages
   - Add Reactions
4. Copy the generated URL
5. Open in browser and invite to your server

### 3. Install Dependencies

```bash
cd discord-bot
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DISCORD_BOT_TOKEN` - From step 1
- `DISCORD_GUILD_ID` - Right-click your server → Copy ID (enable Developer Mode first)
- `DISCORD_CEO_ID` - Right-click your profile → Copy ID
- `LOG_CHANNEL_ID` - Right-click #mod-logs channel → Copy ID
- `WELCOME_CHANNEL_ID` - Right-click #welcome channel → Copy ID

### 5. Create Required Roles

In your Discord server, create these roles:
- `@Member` - Auto-assigned to all new joins
- `@Verified` - Assigned after verification
- `@Pro` - For Pro subscribers
- `@Elite` - For Elite subscribers
- `@Founder Badge` - For first 1,000 members

### 6. Create Required Channels

- `#welcome` - Public, bot posts welcome messages
- `#mod-logs` - Admin-only, bot logs mod actions
- `#verify-access` - Users post payment proof
- `#log-your-wins` - Users share victories
- `#leaderboard` - Bot posts stats (optional)
- `#how-it-works` - Read-only rules/info

## Running the Bot

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### With Docker

```bash
docker build -t gg-loop-discord-bot .
docker run -d --env-file .env gg-loop-discord-bot
```

## Customization

### Banned Words

Edit `data/banned-words.json` to customize the content filter.

### Rate Limits

Edit `.env`:
```
MAX_MESSAGES_PER_10_SECONDS=5
MAX_MATCHES_PER_DAY=20
```

### Whitelisted Domains

Edit `src/config.ts` → `whitelist` array

## Troubleshooting

**Bot doesn't respond:**
- Check bot has proper permissions in server
- Verify bot token is correct
- Enable Message Content Intent

**Auto-roles not working:**
- Check role names match exactly (case-sensitive)
- Ensure bot's role is higher than target roles
- Verify bot has "Manage Roles" permission

**DMs not sending:**
- User might have DMs disabled
- Check bot's embed permissions

## Security

⚠️ **NEVER commit `.env` file to git**
⚠️ **Rotate bot token if leaked**
⚠️ **Review banned-words.json before deployment**

## Support

For issues or questions, contact the GG LOOP team.

---

**Built from the culture, for the culture.**  
**GG LOOP LLC • ggloop.io**
