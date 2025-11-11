# Riot Games API Monetization Compliance Audit
**Platform:** GG Loop  
**Date:** November 11, 2025  
**Policy Source:** https://developer.riotgames.com/policies/general#_monetization

---

## ✅ COMPLIANT Areas

### 1. Free Tier Requirement
**Policy:** "You must have a free tier of access for players, which may include advertising"

**GG Loop Status:** ✅ **COMPLIANT**
- FREE tier now visible on subscription page
- Users can earn 10 GG Coins per win (no payment required)
- Can redeem 500 GG Coins for 7-day trial
- 100 points/month cap for free users
- Access to stats dashboard, match tracking, rewards catalog

---

### 2. No Betting or Gambling
**Policy:** "Your product cannot feature betting or gambling functionality"

**GG Loop Status:** ✅ **COMPLIANT**
- No betting mechanics
- No gambling features
- Points earned through gameplay, not chance
- Deterministic reward system

---

### 3. Transformative Content
**Policy:** "Your content must be transformative if you are charging players for it"
> "Was value added to the original by creating new information, new aesthetics, new insights, and understandings?"

**GG Loop Status:** ✅ **COMPLIANT**
- **New Information:** Win/loss stats, win rate %, monthly point earnings
- **New Insights:** Match history tracking, performance trends
- **New Understanding:** Leaderboards, achievement tracking, tier comparisons
- **Value Add:** Auto-sync eliminates manual tracking, unified dashboard for League + Valorant

**Transformative Features:**
1. Automatic match synchronization (saves time)
2. Cross-game analytics (League + Valorant combined)
3. Performance-based rewards economy (motivational layer)
4. Achievement system (gamification)
5. Public profiles/trophy cases (social element)

---

### 4. No In-Game Advantages
**Policy:** "Products cannot create an unfair advantage for players"

**GG Loop Status:** ✅ **COMPLIANT**
- All rewards are OUTSIDE the game (gift cards, gear, badges)
- No in-game items, boosts, or advantages
- Purely cosmetic badges (Founder's, subscription tier)
- Does not affect ranked ladder or matchmaking

---

### 5. Acceptable Payment Methods
**Policy:** "Acceptable ways to charge players are: Subscriptions, donations, or crowdfunding"

**GG Loop Status:** ✅ **COMPLIANT**
- Uses subscription model ($5/$12/$25 monthly)
- No one-time purchases
- Recurring billing via Stripe
- Cancel anytime

---

## 🚨 POTENTIAL VIOLATIONS

### 1. Currency Exchange to Fiat ⚠️ **HIGH RISK**
**Policy:** "Currencies that cannot be exchanged back into fiat"

**GG Loop Status:** ⚠️ **POTENTIALLY NON-COMPLIANT**

**The Problem:**
- Points use 100:1 dollar conversion ratio
- Users redeem points for **gift cards** (Amazon, Steam, etc.)
- Gift cards = fiat equivalent (can buy anything)
- This could be interpreted as "exchanging back into fiat"

**Riot's Intent:**
- Prevent platforms from becoming de-facto casinos
- Avoid regulatory issues with gambling laws
- Ensure platforms can't be used for money laundering

**Current GG Loop Model:**
```
User pays $5 → Gets 500 points → Redeems for $5 Amazon gift card
```
This looks like: **Pay $5 → Get $5 back** (with gameplay in between)

**Why This Is Problematic:**
- Resembles a cashback/rebate system
- Could be seen as "monetizing Riot's IP for profit"
- Might trigger gambling regulations (pay for chance at profit)
- Riot probably doesn't want liability for this

---

### 2. "Gouging Players or Being Unfair"
**Policy:** "Your monetization cannot gouge players or be unfair (yes, we get to decide that)"

**GG Loop Status:** 🤔 **NEEDS EVALUATION**

**Current Economics:**
- Basic: $5/month → 400 points max → $4 in rewards
- Pro: $12/month → 800 points max → $8 in rewards  
- Elite: $25/month → 1500 points max → $15 in rewards

**Math:**
- Users can earn **60-80%** of subscription cost back in rewards
- Platform loses money if users max out + redeem everything
- Is this "gouging"? Probably not - users get value
- Is this "unfair"? Could argue it's unsustainable

**Riot Might Ask:**
- "How is this profitable for you?" (It's not, without sponsorships)
- "Are you just monetizing our IP?" (Yes, kinda)
- "What value do YOU add beyond Riot's data?" (Stats dashboard, automation)

---

## 🛡️ COMPLIANCE RECOMMENDATIONS

### Fix #1: Change Reward Structure ⚠️ **CRITICAL**

**Problem:** Points → Gift Cards = Fiat Exchange

**Solution Options:**

#### Option A: Non-Fiat Rewards Only (SAFEST)
**Switch to rewards that CANNOT be converted to cash:**
- ✅ Gaming gear (keyboards, mice, headsets)
- ✅ Game skins/RP/VP (NOT redeemable for cash)
- ✅ Merchandise (t-shirts, posters, collectibles)
- ✅ Discord Nitro, Spotify subscriptions
- ✅ Gaming peripherals (webcams, mics)
- ❌ NO gift cards (Amazon, Visa, Steam)
- ❌ NO cash payouts
- ❌ NO cryptocurrency

**Impact:**
- Fully compliant with "no fiat exchange" rule
- Less appealing to users (can't get "cash back")
- Still valuable rewards
- No gambling law concerns

#### Option B: "Loyalty Points" Model (MEDIUM RISK)
**Reframe as non-transferable loyalty benefits:**
- Points = "GG Tokens" (not dollars)
- Can only redeem for specific rewards in catalog
- No fixed exchange rate (remove 100:1 ratio)
- Dynamic pricing based on inventory/sponsorships
- Points expire after 12 months (already implemented)

**Example:**
```
Instead of: "100 points = $1"
Use: "Redeem 5000 GG Tokens for this headset"
```

**Impact:**
- Still offers valuable rewards
- Not a "cashback" system anymore
- Points are loyalty benefits, not currency
- More defensible to Riot

#### Option C: Remove Redemptions Entirely (SAFEST, LEAST APPEALING)
**Make GG Loop purely informational/social:**
- Stats dashboard
- Leaderboards
- Achievement tracking
- Public profiles
- Trophy cases
- NO point redemptions
- Monetize via ads or optional subscriptions for premium stats

**Impact:**
- 100% compliant
- Much less appealing to users
- No "earn money from gaming" value prop
- Loses competitive edge vs other platforms

---

### Fix #2: Emphasize Transformative Value

**Current Problem:** Focus on "earn rewards" → looks like we're just reselling Riot's data

**Solution:** Reframe messaging to highlight OUR unique value:

**Landing Page Should Say:**
- ❌ "Earn money from your League of Legends skills"
- ✅ "Track your performance across League and Valorant in one dashboard"

**Features to Highlight:**
- Auto-sync (saves time)
- Cross-game stats (League + Valorant combined)
- Achievement system (we created this)
- Social features (public profiles, trophy cases)
- Performance insights (win rate trends, etc.)

**Rewards as Secondary Benefit:**
- "Unlock rewards as you improve" (not the main focus)
- "Bonus: Redeem points for gaming gear" (side perk)

---

### Fix #3: Add Riot Legal Boilerplate

**Policy:** "You must post the following legal boilerplate to your product in a location that is readily visible to players"

**Required Text:**
> "GG Loop isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc."

**Where to Add:**
- ✅ Footer of every page
- ✅ Terms of Service
- ✅ About page
- ✅ Landing page (bottom)

---

### Fix #4: Register Product in Developer Portal

**Policy:** "All products must be registered in, and audited by Riot Games through the Developer Portal"

**Action Required:**
1. Go to https://developer.riotgames.com/
2. Register GG Loop as a product
3. Submit for audit
4. Wait for "Approved" or "Acknowledged" status
5. **Cannot monetize until approved/acknowledged**

**Current Status:** ❓ Unknown if registered

---

## 📋 COMPLIANCE CHECKLIST

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Free tier available | ✅ Done | None |
| No betting/gambling | ✅ Done | None |
| Transformative content | ✅ Done | Improve messaging |
| No in-game advantages | ✅ Done | None |
| Subscription payment | ✅ Done | None |
| **Fiat currency exchange** | ❌ **VIOLATION** | **Remove gift cards OR switch to loyalty model** |
| Legal boilerplate visible | ❌ Missing | Add to footer/ToS |
| Registered in Dev Portal | ❓ Unknown | Register + submit for audit |
| Not gouging players | 🤔 Unclear | Consider pricing sustainability |

---

## 🎯 RECOMMENDED ACTION PLAN

### Immediate (This Week)
1. **Add Riot legal boilerplate** to footer (5 mins)
2. **Register in Developer Portal** and submit for audit
3. **Remove gift card rewards temporarily** until approved
4. **Switch to gaming gear/peripherals** for rewards catalog

### Short-Term (Before Launch)
5. **Reframe messaging** to emphasize stats/tracking (not earnings)
6. **Remove 100:1 ratio** from public-facing content
7. **Use "GG Tokens" not "points worth $X"**
8. **Wait for Riot approval** before re-enabling monetization

### Long-Term (Post-Approval)
9. **Add sponsor-funded challenges** (if approved)
10. **Explore tournament integration** (follows separate policies)
11. **Build community features** (forums, teams, clans)

---

## 💬 What to Tell Riot in Developer Portal

**When submitting GG Loop for audit, emphasize:**

1. **Transformative Value:**
   - "We aggregate League + Valorant stats in one unified dashboard"
   - "Auto-sync eliminates manual match tracking"
   - "Social features create community around gameplay"

2. **Reward System:**
   - "Points are loyalty benefits, not currency"
   - "No cash payouts or gift cards"
   - "Redeem for gaming peripherals/gear only"
   - "Non-transferable, expires after 12 months"

3. **Subscription Model:**
   - "Premium stats and insights"
   - "Free tier available for all players"
   - "Subscription unlocks enhanced tracking + rewards"

4. **Compliance:**
   - "Free tier with advertising option"
   - "No betting or gambling"
   - "No in-game advantages"
   - "Legal boilerplate displayed"

---

## ⚖️ BOTTOM LINE

**Current Status:** ⚠️ **LIKELY NON-COMPLIANT**

**Critical Issue:** Gift card redemptions = fiat currency exchange

**Fix Required:** Switch to non-fiat rewards (gaming gear, subscriptions, merchandise)

**Timeline:** Fix BEFORE registering in Developer Portal (they'll reject you)

**Good News:** Easy to fix - just change rewards catalog

**Risk if Ignored:** Riot could revoke API access, demand platform shutdown, or legal action

---

**Next Steps:**
1. Remove gift cards from rewards catalog
2. Add gaming gear/peripherals instead
3. Add Riot legal boilerplate
4. Register in Developer Portal
5. Wait for approval before enabling subscriptions

*DO NOT MONETIZE UNTIL APPROVED BY RIOT.*
