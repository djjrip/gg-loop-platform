# 🛡️ GG Loop Backup & Recovery Guide

This guide will help you protect your GG Loop platform from data loss.

## 📋 Table of Contents
1. [Quick Start - Run a Backup Now](#quick-start)
2. [GitHub Setup (Recommended)](#github-setup)
3. [Database Backups](#database-backups)
4. [Secrets Documentation](#secrets-documentation)
5. [Recovery Procedures](#recovery-procedures)

---

## 🚀 Quick Start

**Run a backup right now:**

```bash
bash scripts/backup-database.sh
```

This creates a compressed backup in the `backups/` folder. **Download this file and save it somewhere safe** (Google Drive, Dropbox, external drive).

---

## 🐙 GitHub Setup (Recommended)

### Why GitHub?
- Automatic version control
- Free private repositories
- Easy recovery if Replit goes down
- Collaborate with developers
- Track all changes over time

### Setup Steps

#### 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `gg-loop-platform` (or your choice)
3. **Make it PRIVATE** ⚠️
4. Don't initialize with README (we already have code)
5. Click "Create repository"

#### 2. Connect Your Replit to GitHub

**Option A: Using Replit's Git UI (Easiest)**
1. In Replit, open the Shell
2. Run these commands:

```bash
git config --global user.email "jaysonquindao@ggloop.io"
git config --global user.name "Jayson Quindao"
git init
git add .
git commit -m "Initial commit - GG Loop platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gg-loop-platform.git
git push -u origin main
```

**Option B: Using Replit's Version Control**
1. Click the "Version Control" icon in the sidebar
2. Click "Connect to GitHub"
3. Authorize Replit
4. Select your repository

#### 3. Future Updates

After making changes, commit them:

```bash
git add .
git commit -m "Description of changes"
git push
```

**Set up automatic backups** - add this to your Replit Secrets as a cron job or run weekly.

---

## 💾 Database Backups

### Automatic Backup Script

**Run weekly:**
```bash
bash scripts/backup-database.sh
```

**What it does:**
- Exports your entire PostgreSQL database
- Compresses it (saves space)
- Stores in `backups/` folder
- Shows you the file size

**After running:**
1. Download the `.sql.gz` file from the `backups/` folder
2. Upload to Google Drive or Dropbox
3. Optionally delete old backups from Replit (save space)

### Manual Backup

If you prefer to do it yourself:

```bash
# Create backup directory
mkdir -p backups

# Export database (replace with current date)
pg_dump $DATABASE_URL > backups/manual-backup-20251118.sql

# Compress it
gzip backups/manual-backup-20251118.sql
```

### What's Included in Database Backups

Your database contains:
- All user accounts (10,000+ users)
- Points balances and transaction history
- Subscription data
- Rewards inventory and redemptions
- Match history and stats
- Achievements and leaderboards
- Charity campaigns
- All platform data

---

## 🔐 Secrets Documentation

### Creating a Secrets Backup

**⚠️ IMPORTANT: Secrets are NEVER stored in Git!**

1. Run the secrets template generator:
```bash
bash scripts/backup-secrets.sh
```

2. Open the generated file: `backups/SECRETS-TEMPLATE-[date].txt`

3. Fill in your actual values from Replit Secrets:
   - PayPal Client ID & Secret
   - Stripe API keys
   - Riot API key
   - Discord/Twitch OAuth credentials
   - Tango Card credentials
   - Session secret
   - etc.

4. **Save this file somewhere VERY secure:**
   - Password manager (1Password, Bitwarden, LastPass)
   - Encrypted USB drive
   - Secure cloud storage with encryption

5. **DELETE the file from Replit** after saving elsewhere

### Why Document Secrets?

If Replit goes down, you'll need these to:
- Set up the platform elsewhere (AWS, DigitalOcean, etc.)
- Reconnect to PayPal/Stripe
- Restore OAuth integrations
- Access Riot API

---

## 🔄 Recovery Procedures

### Scenario 1: Replit is Down Temporarily

**Action:** Wait it out. Replit has 99.9% uptime and issues are usually resolved quickly.

Your data is safe because:
- Database is hosted on Neon (separate from Replit)
- Object Storage is on Google Cloud
- Code is backed up on GitHub

### Scenario 2: Need to Restore Database

**If you accidentally delete data:**

```bash
# Decompress backup
gunzip -c backups/ggloop-backup-20251118.sql.gz > restore.sql

# Restore to database
psql $DATABASE_URL < restore.sql
```

**If you deleted the database:**
- Contact Replit Support within 7 days (they keep deleted databases for 7 days)
- Or restore from your backup file

### Scenario 3: Moving to Another Platform

**If you need to leave Replit entirely:**

1. **Code:**
   - Clone from GitHub: `git clone https://github.com/YOUR_USERNAME/gg-loop-platform.git`
   - Or download ZIP from Replit

2. **Database:**
   - Use your latest backup: `gunzip -c backup.sql.gz | psql $NEW_DATABASE_URL`
   - Or migrate from Neon directly

3. **Object Storage:**
   - Download files from Google Cloud Storage
   - Re-upload to new storage provider

4. **Secrets:**
   - Use your secrets backup to reconfigure environment variables

5. **Deploy:**
   - Options: Vercel, Railway, Render, AWS, DigitalOcean, etc.
   - Point environment variables to new database
   - Upload secrets
   - Deploy code

---

## 📅 Recommended Backup Schedule

### Daily (Automatic)
- Replit auto-saves your code
- GitHub commits (if you push regularly)

### Weekly
```bash
bash scripts/backup-database.sh
```
- Download the backup file
- Save to cloud storage

### Monthly
- Update your secrets documentation
- Review and test recovery process
- Archive old backups

### Before Major Changes
- Always backup before:
  - Database schema migrations
  - Major feature launches
  - Bulk data operations
  - Testing new payment features

---

## ✅ Backup Checklist

- [ ] GitHub repository created and connected
- [ ] Initial code pushed to GitHub
- [ ] Database backup script tested
- [ ] Secrets documented and saved securely
- [ ] Backup files downloaded and stored off Replit
- [ ] Recovery process tested (optional but recommended)

---

## 🆘 Emergency Contacts

**If you need help:**

- **Replit Support:** https://replit.com/support
- **Discord Community:** https://discord.gg/X6GXg2At2D
- **Email:** jaysonquindao@ggloop.io

**Database Provider (Neon):**
- If Replit database issues: contact Replit Support first
- Neon has their own 7-day point-in-time recovery

---

## 🎯 Final Recommendations

1. **Set a weekly reminder** to run database backups
2. **Push to GitHub after every major change**
3. **Keep secrets in a password manager**
4. **Test your recovery process once** (restore to a test environment)
5. **Document any custom configurations** you make

**Your platform is valuable - protect it!** 🛡️
