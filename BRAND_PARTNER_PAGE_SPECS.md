# BRAND PARTNER PAGE SPECS
**Blueprint for /partners/[brand] Pages (Documentation Only)**

Last Updated: December 10, 2025

---

## OVERVIEW

This document outlines the structure and content for brand partner pages on GG LOOP. These pages will live at `/partners/[brand]` (e.g., `/partners/nike`, `/partners/logitech`).

**⚠️ IMPORTANT:** This is a DOCUMENTATION-ONLY blueprint. NO CODE IMPLEMENTATION. Use this as a reference when ready to build.

---

## PAGE STRUCTURE

### 1. HERO SECTION

**Purpose:** Immediate brand recognition + value prop

**Content Elements:**
- **Brand Logo:** Large, centered (200px height)
- **Partnership Headline:** "[Brand] × GG LOOP"
- **Subheadline:** "Earn [Brand] rewards by playing [games/activities]"
- **CTA Button:** "View Missions" (scroll to missions section)
- **Background:** Brand colors or product imagery

**Example (Nike):**
```
[Nike Swoosh Logo - 200px]

Nike × GG LOOP

Earn Nike gear by grinding NBA 2K and basketball games

[View Missions Button]

Background: Nike orange/red gradient
```

**Example (Logitech G):**
```
[Logitech G Logo - 200px]

Logitech G × GG LOOP

Upgrade your setup by completing gaming missions

[View Missions Button]

Background: Logitech G blue/black
```

---

### 2. STORY SECTION

**Purpose:** Explain why this partnership exists

**Content Elements:**
- **Headline:** "Why [Brand]?"
- **Body Text:** 2-3 paragraphs explaining cultural fit
- **Founder Quote:** Personal note from Jayson
- **Visual:** Product photo or community image

**Example (Nike):**
```
Why Nike?

Our community lives at the intersection of basketball and gaming. They're grinding NBA 2K, climbing ranked ladders, and rocking Nikes while they do it. This partnership rewards that grind with the gear they already love.

"I grew up playing hoops in Nikes. Now I'm grinding ranked in them. This partnership just makes sense - rewarding the gaming grind with basketball culture." - Jayson BQ, Founder

[Image: Basketball court + gaming setup]
```

**Example (Costco):**
```
Why Costco?

Filipino-American gamers love Costco. It's where we stock up on gaming snacks, drinks, and gear. This partnership rewards your gaming grind with gift cards you'll actually use.

"Costco runs are a family tradition. Now you can earn them by gaming. That's the move." - Jayson BQ, Founder

[Image: Costco shopping cart with gaming snacks]
```

---

### 3. MISSION PACKS SECTION

**Purpose:** Show available missions and rewards

**Content Elements:**
- **Headline:** "[Brand] Mission Packs"
- **Mission Cards:** 3-5 active missions
- **Each Card Includes:**
  - Mission name
  - Description (1-2 sentences)
  - Points required
  - Reward (specific product or gift card amount)
  - Progress bar (if user is logged in)
  - "Start Mission" button

**Example Mission Card (Nike):**
```
┌─────────────────────────────────┐
│ Hoops Grind: NBA 2K Edition     │
│                                 │
│ Play 50 NBA 2K games this month │
│ Points: 5,000                   │
│ Reward: $50 Nike Gift Card      │
│                                 │
│ Progress: ████░░░░░░ 40%        │
│                                 │
│ [Continue Mission]              │
└─────────────────────────────────┘
```

**Example Mission Card (Logitech G):**
```
┌─────────────────────────────────┐
│ Setup Upgrade: Competitive Edge │
│                                 │
│ Win 100 ranked matches          │
│ Points: 10,000                  │
│ Reward: Logitech G Pro Mouse    │
│                                 │
│ Progress: ██░░░░░░░░ 20%        │
│                                 │
│ [Start Mission]                 │
└─────────────────────────────────┘
```

---

### 4. REWARD LIST SECTION

**Purpose:** Show all available rewards from this brand

**Content Elements:**
- **Headline:** "Available [Brand] Rewards"
- **Filter Options:** By points, by category, by availability
- **Reward Cards:** Grid layout (3-4 per row)
- **Each Card Includes:**
  - Product image
  - Product name
  - Points cost
  - Availability status
  - "Redeem" button (if user has enough points)

**Example Reward Card (Nike):**
```
┌─────────────────┐
│ [Nike Shoe Img] │
│                 │
│ Nike Air Max    │
│ 15,000 points   │
│                 │
│ ✅ Available    │
│                 │
│ [Redeem Now]    │
└─────────────────┘
```

**Example Reward Card (Target):**
```
┌─────────────────┐
│ [Gift Card Img] │
│                 │
│ $25 Gift Card   │
│ 2,500 points    │
│                 │
│ ✅ Available    │
│                 │
│ [Redeem Now]    │
└─────────────────┘
```

---

### 5. FAQ SECTION

**Purpose:** Answer common questions about this partnership

**Content Elements:**
- **Headline:** "Frequently Asked Questions"
- **Accordion-style Q&A:** 5-8 questions
- **Questions Should Cover:**
  - How to earn points
  - How to redeem rewards
  - Shipping/fulfillment timeline
  - Eligibility requirements
  - Partnership duration

**Example FAQs (Nike):**
```
Q: How do I earn Nike rewards?
A: Complete Nike mission packs (e.g., "Hoops Grind") to earn points. Redeem points for Nike gift cards or products.

Q: How long does fulfillment take?
A: 7-14 business days after redemption. We manually process all rewards to ensure quality.

Q: Can I choose specific Nike products?
A: Gift cards give you full choice. Specific products are pre-selected based on community votes.

Q: Is this partnership permanent?
A: We're running a pilot program. If successful, it'll continue long-term.

Q: Do I need to be a subscriber?
A: No! Free users can earn Nike rewards. Subscribers get bonus points.
```

---

## DESIGN SPECIFICATIONS

### Colors
- **Primary:** Brand colors (Nike orange, Logitech blue, etc.)
- **Secondary:** GG LOOP colors (GG Blue, GG Purple)
- **Background:** Dark (#1E293B) or White (#FFFFFF)
- **Text:** High contrast for readability

### Typography
- **Headings:** Inter Bold (36-48px)
- **Body:** Inter Regular (16-18px)
- **Small:** Inter Regular (14px)

### Layout
- **Responsive:** Mobile-first design
- **Grid:** 12-column grid system
- **Spacing:** Consistent padding/margins (16px, 32px, 64px)
- **Cards:** Rounded corners (8px), subtle shadows

### Images
- **Hero Background:** 1920x1080px minimum
- **Product Images:** 800x800px square
- **Brand Logos:** SVG preferred (scalable)
- **Community Photos:** Authentic, not stock

---

## TECHNICAL REQUIREMENTS (FOR FUTURE IMPLEMENTATION)

### URL Structure
```
/partners/[brand-slug]

Examples:
/partners/nike
/partners/logitech-g
/partners/cash-app
```

### Data Sources
- **Missions:** Pull from `missions` table (filter by `brand_id`)
- **Rewards:** Pull from `rewards` table (filter by `brand_id`)
- **User Progress:** Pull from `user_missions` table (if logged in)

### SEO
- **Title:** "[Brand] Rewards | GG LOOP"
- **Description:** "Earn [Brand] rewards by playing games on GG LOOP. Complete missions, earn points, redeem real [Brand] products."
- **Keywords:** "[brand], gaming rewards, [brand] partnership, earn [brand] gear"

### Performance
- **Load Time:** < 2 seconds
- **Images:** Lazy loading
- **Caching:** Cache brand pages (update every 24 hours)

---

## CONTENT GUIDELINES

### Tone
- **Authentic:** Use GG LOOP voice (casual, honest, direct)
- **Brand-Aligned:** Match brand's tone where appropriate
- **Cultural:** Highlight cultural fit (basketball, sneakers, Filipino, gaming)

### Copy Rules
- **Headlines:** Short, punchy, benefit-focused
- **Body Text:** 2-3 sentences max per paragraph
- **CTAs:** Action-oriented ("Redeem Now", "Start Mission")
- **Disclaimers:** Clear, honest ("Manual fulfillment, 7-14 days")

### Visuals
- **Product Photos:** High-res, clean backgrounds
- **Community Images:** Real users, real setups
- **Brand Assets:** Official logos, approved imagery only

---

## EXAMPLE PAGE WIREFRAME

```
┌─────────────────────────────────────────────┐
│ HERO SECTION                                │
│ [Brand Logo]                                │
│ [Brand] × GG LOOP                           │
│ Earn [Brand] rewards by playing             │
│ [View Missions Button]                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ STORY SECTION                               │
│ Why [Brand]?                                │
│ [2-3 paragraphs]                            │
│ [Founder Quote]                             │
│ [Image]                                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ MISSION PACKS SECTION                       │
│ [Brand] Mission Packs                       │
│ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │Mission1│ │Mission2│ │Mission3│          │
│ └────────┘ └────────┘ └────────┘          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ REWARD LIST SECTION                         │
│ Available [Brand] Rewards                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│ │Rwd1│ │Rwd2│ │Rwd3│ │Rwd4│               │
│ └────┘ └────┘ └────┘ └────┘               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ FAQ SECTION                                 │
│ Frequently Asked Questions                  │
│ ▼ Q: How do I earn rewards?                │
│ ▼ Q: How long does fulfillment take?       │
│ ▼ Q: Can I choose products?                │
└─────────────────────────────────────────────┘
```

---

## IMPLEMENTATION CHECKLIST (FOR FUTURE)

When ready to build:

- [ ] Create `/partners/[brand]` route
- [ ] Design hero section (brand colors + logo)
- [ ] Write story section copy (why this brand)
- [ ] Pull missions from database (filter by brand)
- [ ] Pull rewards from database (filter by brand)
- [ ] Add user progress tracking (if logged in)
- [ ] Write FAQ section (5-8 questions)
- [ ] Add SEO meta tags
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Optimize images (lazy loading)
- [ ] Add analytics tracking
- [ ] Get brand approval before launch

---

**Questions? Ready to implement?**  
Contact: Jayson BQ (info@ggloop.io)
