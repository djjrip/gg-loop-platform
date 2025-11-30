# ✅ GG LOOP BACKUP CHECKLIST

Print this out or save it to check off as you complete each step.

---

## 🎯 Initial Setup (Do Once)

### GitHub Setup
- [ ] Create GitHub account at https://github.com/signup
- [ ] Create private repository called `gg-loop-platform`
- [ ] Run: `git config --global user.email "jaysonquindao@ggloop.io"`
- [ ] Run: `git config --global user.name "Jayson Quindao"`
- [ ] Run: `git init`
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Initial commit - GG Loop platform"`
- [ ] Run: `git remote add origin https://github.com/YOUR_USERNAME/gg-loop-platform.git`
- [ ] Run: `git push -u origin main`
- [ ] Verify code appears on GitHub website

### First Database Backup
- [ ] Run: `bash scripts/backup-database.sh`
- [ ] Download backup file from `backups/` folder
- [ ] Upload to Google Drive or Dropbox
- [ ] Verify file is accessible in cloud storage
- [ ] Delete from Replit to save space (optional)

### Secrets Documentation
- [ ] Run: `bash scripts/backup-secrets.sh`
- [ ] Open generated template file
- [ ] Fill in all PayPal credentials
- [ ] Fill in all Stripe credentials
- [ ] Fill in Riot API key
- [ ] Fill in Discord/Twitch OAuth credentials
- [ ] Fill in gift-card provider credentials if using one (e.g., Tremendous) — Tango Card previously considered but not active
- [ ] Fill in Session secret
- [ ] Save to password manager (1Password, Bitwarden, etc.)
- [ ] **DELETE file from Replit**
- [ ] Verify secrets are accessible in password manager

### Documentation Review
- [ ] Read `BACKUP_GUIDE.md`
- [ ] Understand recovery procedures
- [ ] Bookmark important links
- [ ] Save support contacts

---

## 📅 Weekly Routine (Every Monday)

- [ ] Run: `bash scripts/backup-database.sh`
- [ ] Download latest backup file
- [ ] Upload to cloud storage (Google Drive/Dropbox)
- [ ] Push any code changes to GitHub: `git add . && git commit -m "Weekly update" && git push`
- [ ] Verify GitHub is up to date
- [ ] Delete old backup files from Replit (keep last 2-3)

**Time Required:** 5 minutes

---

## 🔄 Before Major Changes

Run this checklist before:
- Database migrations
- New feature launches  
- Payment system updates
- Bulk data operations

- [ ] Run database backup
- [ ] Download backup file
- [ ] Save to cloud storage
- [ ] Commit current code to GitHub
- [ ] Document what you're about to change
- [ ] Proceed with changes

---

## 📆 Monthly Review

- [ ] Verify GitHub repository is current
- [ ] Review and update secrets documentation
- [ ] Clean up old backup files from cloud storage (keep last 4-6)
- [ ] Verify password manager has all current secrets
- [ ] Test downloading one backup file
- [ ] Review `BACKUP_GUIDE.md` for any updates needed

**Time Required:** 15 minutes

---

## 🆘 Emergency Procedures

### If Replit Goes Down
- [ ] Don't panic - your data is safe!
- [ ] Check Replit status: https://status.replit.com
- [ ] Code is on GitHub
- [ ] Database is on Neon (separate from Replit)
- [ ] Backups are in cloud storage
- [ ] Wait for Replit to come back online

### If You Accidentally Delete Data
- [ ] Contact Replit Support immediately (7-day retention)
- [ ] Check your latest backup file
- [ ] Prepare to restore from backup if needed
- [ ] Review restore command: `gunzip -c backup.sql.gz | psql $DATABASE_URL`

### If You Lose Access to Secrets
- [ ] Check password manager
- [ ] Check secrets backup template
- [ ] Regenerate API keys if needed (PayPal, Stripe, Riot)
- [ ] Update environment variables in Replit
- [ ] Test all integrations

---

## 📊 Status Check

### Green Light ✅
You're fully protected if ALL of these are true:
- [ ] GitHub repository exists and is current (updated within 7 days)
- [ ] Latest database backup is less than 7 days old
- [ ] Database backup is saved in cloud storage
- [ ] All secrets are documented in password manager
- [ ] You know how to restore from backups
- [ ] You have tested the backup process at least once

### Yellow Light ⚠️
Take action soon if ANY of these are true:
- [ ] GitHub not updated in 7-14 days
- [ ] Latest backup is 7-14 days old
- [ ] Secrets not fully documented
- [ ] Haven't tested restore process

### Red Light 🚨
Take action NOW if ANY of these are true:
- [ ] No GitHub repository set up
- [ ] No database backups exist
- [ ] Latest backup is over 14 days old
- [ ] Secrets not documented anywhere
- [ ] Don't know how to restore

---

## 🎯 Quick Reference Commands

### Create Database Backup
```bash
bash scripts/backup-database.sh
```

### Create Secrets Template
```bash
bash scripts/backup-secrets.sh
```

### Push Code to GitHub
```bash
git add .
git commit -m "Your description here"
git push
```

### Restore Database (Emergency)
```bash
gunzip -c backups/ggloop-backup-TIMESTAMP.sql.gz | psql $DATABASE_URL
```

---

## 📞 Support Contacts

**Replit Support:** https://replit.com/support  
**Your Email:** jaysonquindao@ggloop.io  
**Discord Community:** https://discord.gg/X6GXg2At2D

---

**Last Updated:** November 18, 2025  
**Next Review:** December 18, 2025
