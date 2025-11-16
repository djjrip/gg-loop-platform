# GG Loop Reward Fulfillment Guide

## When Someone Redeems a Reward

**You'll see a notification in your Replit logs like this:**
```
🎁 REWARD REDEMPTION ALERT 🎁
User: user@email.com (John)
Reward: Steam $10 Gift Card
Points Spent: 350
Real Value: $10
Time: 11/10/2025, 3:45:12 PM
ACTION NEEDED: Buy and email gift card code to user@email.com
```

## Fulfillment Process (5 minutes per redemption)

### Step 1: Buy the Gift Card
**Where to buy discounted gift cards:**
- **Tango Card** - Wholesale API integration (recommended)
- **CardCash.com** - Wholesale pricing
- **Direct from retailer** - Steam, Xbox, PlayStation stores

### Step 2: Email the Code to User
**Email Template:**
```
Subject: Your GG Loop Reward - [Reward Name]

Hey [User Name]!

Your reward is ready! Here's your gift card code:

CODE: XXXX-XXXX-XXXX-XXXX

Reward: [Reward Name]
Value: $[Amount]

To redeem:
1. Go to [Platform] (Steam/Xbox/etc.)
2. Enter code in gift card/redeem section
3. Enjoy!

Questions? Reply to this email.

Keep looping!
- GG Loop Team
```

### Step 3: Mark as Fulfilled (Manual for now)
Just keep track in a simple spreadsheet or note. Admin panel coming later when you have more volume.

---

## Gift Card Sources Cheat Sheet

| Reward Type | Where to Buy | Typical Discount |
|------------|--------------|------------------|
| Steam | Tango Card API | Wholesale pricing |
| Xbox/PlayStation | Tango Card API | Wholesale pricing |
| Amazon | Tango Card API | Wholesale pricing |
| Discord Nitro | Direct from Discord | No discount |

---

## Profit Margin Example

**User redeems $10 Steam card (100 points):**
- You buy for: $9 via wholesale supplier
- Profit: $1
- Your $5 subscription covers ~5 redemptions/month
- Break-even: Users need to earn less than 500 points/month

---

## Monitoring Redemptions

**Check Replit Logs:**
1. Open your Replit project
2. Click "Console" tab at bottom
3. Watch for 🎁 alerts

**Check Database (Advanced):**
1. Open Database tool in Replit
2. Query: `SELECT * FROM user_rewards ORDER BY redeemed_at DESC LIMIT 10`
3. See all recent redemptions

---

## Adding New Rewards

**For now, ask me (the AI) to add rewards via database.**

**Later:** You can use the admin panel (build when you have 50+ users)

---

## Common Questions

**Q: What if I can't fulfill a reward?**
A: Email the user explaining the delay, offer bonus points as compensation

**Q: How do I handle fraud?**
A: Watch for suspicious patterns (same user claiming repeatedly, new accounts redeeming immediately). Manually review and can block users via database.

**Q: What if a gift card code doesn't work?**
A: Buy a replacement, email new code, track the bad seller to avoid in future

---

## Emergency Contacts

**Gift Card Issues:**
- Tango Card support: support@tangocard.com
- CardCash: 888-289-8018

**Need Help?**
- Replit Discord: discord.gg/replit
- Email yourself notes/reminders for patterns you notice
