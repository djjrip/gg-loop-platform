# How to Pitch GG Loop to Riot Games Developer Relations Discord

## 🎯 **Discord Community Details**

**Link:** https://discord.gg/riotgamesdevrel  
**Purpose:** Technical discussion for developers building tools/apps using Riot Games APIs  
**NOT for:** Game bugs, account issues, or generic marketing

---

## ⚠️ **CRITICAL RULES - READ FIRST**

### What This Discord IS For:
✅ Technical help with Riot APIs (JavaScript, Python, C#)  
✅ Discussing tools, websites, apps using Riot data  
✅ Real-time communication with Riot DevRel team  
✅ Getting feedback on API integration  

### What This Discord is NOT For:
❌ Marketing your product to users (they'll ban you)  
❌ Game bugs or player support (use https://support.riotgames.com/)  
❌ Pitching for investment or partnerships  
❌ Spamming self-promotion  

**Violating these rules = instant removal**

---

## 🚀 **Your Pitch Strategy (3-Step Approach)**

### Step 1: Join & Lurk (Week 1)
**Goal:** Understand the community before posting

1. Read channel descriptions and pinned messages  
2. Search past conversations for similar projects  
3. Observe how developers ask questions  
4. Note DevRel team members' usernames  

**Pro Tip:** Look for "approved product" announcements - these show what Riot values

---

### Step 2: Introduce Yourself (Week 2)
**Channel:** `#introductions` or `#general`

**Template Message:**

```
Hey everyone! 👋

I'm [Your Name], building GG Loop - a platform that lets League/Valorant players earn real-world rewards for verified match wins using Riot's API.

**Current status:**
✅ Production API key approved by Riot
✅ Working prototype with Riot account linking
✅ Auto-verification system (queueId-based match validation)
✅ First 15 users testing the platform

**What I'm working on:**
- Expanding to more games (currently LoL & Valorant)
- Building fraud prevention for match verification
- Reward fulfillment system integration

Looking forward to learning from you all and contributing where I can!

**Tech stack:** Node.js, PostgreSQL, Riot API (Match-V5, Summoner-V4)
```

**Why this works:**
- Shows you're already approved (credibility)  
- Focuses on technical details (not marketing)  
- Specific about your implementation  
- Invites technical discussion  

---

### Step 3: Engage Technically (Ongoing)

**DO:**
✅ Answer other developers' questions when you can  
✅ Share technical insights from your implementation  
✅ Ask specific API questions (not generic marketing)  
✅ Post updates when you solve hard problems  

**Example Good Question:**
```
Quick question about match verification best practices:

I'm using queueId to derive match type (Ranked vs Normal) and prevent users from claiming the same match twice. Currently checking:
- UNIQUE(userId, riotMatchId) constraint in DB
- 24-hour lookback window for match history
- HMAC signature validation for webhooks

Anyone else building match verification systems? What edge cases should I watch for?
```

**Why this works:**
- Technical and specific  
- Shows you've done your homework  
- Invites collaboration, not promotion  

---

## 🎯 **What Riot DevRel Cares About**

### Green Flags (They'll Support You)
✅ **Benefits the ecosystem** - Makes LoL/Valorant more engaging  
✅ **Complies with policies** - Doesn't automate gameplay or de-anonymize players  
✅ **Authentic user experience** - Not pay-to-win or exploitative  
✅ **Technical excellence** - Proper API usage, error handling, rate limiting  

### Red Flags (They'll Reject You)
❌ Removes game decisions (automation/botting)  
❌ Alternative skill ranking systems (MMR calculators)  
❌ De-anonymizing players beyond visible info  
❌ Exposing historic Riot IDs  
❌ Pay-to-win mechanics  
❌ Crypto related projects

---

## 📋 **Formal Registration (After Community Acceptance)**

Once you've established presence in Discord:

### 1. **Developer Portal Registration**
- Visit: https://developer.riotgames.com/  
- Click "Register Product"  
- You already have Production API key ✅

### 2. **Application Materials You Already Have**
✅ Working prototype (GG Loop platform)  
✅ User flow documented (account creation → match verification → rewards)  
✅ Riot API integration live  
✅ Clear benefit to ecosystem (rewards players for skill)  

### 3. **What to Submit**
- **Product Name:** GG Loop  
- **Description:** Platform that verifies League/Valorant match wins via Riot API and awards real-world rewards (gift cards, subscriptions)  
- **Use Case:** Rewards & Incentivization System  
- **Target Audience:** Casual to competitive LoL/Valorant players aged 18-30  
- **Monetization:** Subscription model ($5/month Basic tier)  
- **API Endpoints Used:**  
  - Match-V5 (match history, match details)  
  - Summoner-V4 (account linking)  
  - Account-V1 (Riot ID verification)  

### 4. **Supporting Documents**
- **Screenshots:** Platform dashboard, match verification flow, rewards catalog  
- **Demo Video:** 2-minute walkthrough  
- **User Flow Diagram:** Account link → Win match → Auto-verify → Earn points → Redeem reward  

---

## 💬 **Sample Conversation Starters**

### When Asking for Feedback:
```
Looking for feedback on my match verification approach:

**Current flow:**
1. User links Riot account (PUUID stored)
2. User clicks "Report Win"
3. System fetches last 5 matches via Match-V5
4. Checks UNIQUE(userId, riotMatchId) to prevent duplicates
5. Awards points based on queueId (420=Ranked, 440=Flex, etc.)

**Question:** Should I implement a webhook listener instead of polling match history? Or is the current approach fine for ~1000 users?

Context: Currently processing ~50 match verifications/day.
```

### When Sharing a Win:
```
Solved a tricky fraud prevention issue! 🎉

**Problem:** Users were submitting the same match multiple times for points.

**Solution:** 
1. Added UNIQUE(user_id, riot_match_id) database constraint
2. Check submission history before awarding points
3. Store full match metadata for audit trail

If anyone's building similar verification systems, happy to share more details!
```

---

## 🚨 **Common Mistakes to Avoid**

### ❌ **Don't Do This:**
```
"Hey everyone! Check out GG Loop - the best way to earn money playing League! 
Link in bio. Use code FOUNDER for discount!"
```
**Why it fails:** Pure marketing, no technical value

### ✅ **Do This Instead:**
```
"Built a fraud-proof match verification system using Riot API. 
Happy to discuss implementation details if anyone's working on similar challenges."
```
**Why it works:** Technical focus, offers value to community

---

## 📊 **Timeline & Milestones**

### Week 1-2: Observe & Learn
- Read past discussions
- Understand community culture
- Identify active DevRel members

### Week 3: Soft Introduction
- Post intro in #introductions
- Ask 1-2 technical questions
- Answer others' questions when possible

### Week 4-8: Build Credibility
- Share technical insights
- Post progress updates
- Engage in API discussions

### Week 8+: Formal Pitch (If Appropriate)
- Request Production API rate increase
- Share user growth metrics
- Propose partnership opportunities (if invited)

---

## 🎯 **What Success Looks Like**

### Short-Term (1-3 months)
✅ Active member of Discord community  
✅ DevRel team knows your project  
✅ Other developers reference your work  
✅ Production API rate limits increased  

### Long-Term (6-12 months)
✅ Featured in Riot DevRel blog post  
✅ Invited to developer meetups/events  
✅ Considered for Underrepresented Founders Program  
✅ Potential Riot partnership discussions  

---

## 💡 **Insider Tips from Approved Developers**

1. **Be Patient:** Riot approval takes weeks/months, not days  
2. **Show, Don't Tell:** Working prototype > pitch deck  
3. **Technical > Marketing:** They're engineers, not VCs  
4. **Compliance First:** If you violate policies, you're banned forever  
5. **Community Value:** Help others to build reputation  

---

## 🔗 **Additional Resources**

- **DevRel Homepage:** https://www.riotgames.com/en/DevRel  
- **API Documentation:** https://developer.riotgames.com/docs/portal  
- **Bug Reporting:** https://github.com/RiotGames/developer-relations  
- **Twitter:** @riotgamesdevrel  

---

## 📞 **When to Use Support vs. Discord**

| Situation | Use Discord | Use Support Site |
|-----------|-------------|------------------|
| Technical API question | ✅ Yes | ❌ No |
| Product registration help | ❌ No | ✅ Yes |
| Rate limit increase request | ❌ No | ✅ Yes |
| General brainstorming | ✅ Yes | ❌ No |
| Formal partnership inquiry | ❌ No | ✅ Yes |

---

## 🚀 **Your Immediate Action Plan**

### Today:
1. ✅ Join Discord: https://discord.gg/riotgamesdevrel  
2. Read pinned messages in all channels  
3. Search for "rewards" or "points" to see similar projects  

### This Week:
1. Post introduction in #introductions  
2. Ask 1-2 technical questions  
3. Answer others' questions where you can  

### Next Month:
1. Share progress update with metrics  
2. Request rate limit increase if needed  
3. Engage with DevRel team organically  

---

## ⚡ **Final Pro Tip**

**Don't pitch GG Loop as a business. Pitch it as a tool that makes Riot's games more rewarding for players.**

Frame it as:  
*"I built this because I wanted my League wins to mean something. Riot's API made it possible."*

Not:  
*"I'm building a subscription platform that monetizes Riot's player base."*

---

**Questions? Stuck on something?**  
Just ask in Discord! The community is helpful if you approach it right. 🎮

Good luck! 🚀
