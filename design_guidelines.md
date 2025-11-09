# GG Loop Design Guidelines

## Design Approach: Reference-Based (Premium Gaming Guild)

**Selected References:** Nike SNKRS app, Behance, Dribbble (dark mode), premium streetwear sites, Apple's product pages
**Key Principle:** Sophisticated gaming guild atmosphere—tribal community with street credibility, grounded earthy aesthetic, exclusive members-club energy.

**Design Direction:** Dark earthy palette with muted warm accents (burnt orange, terracotta, clay), natural textures, premium typography, data-rich dashboards that celebrate streamer growth without casino-like energy.

---

## Typography System

**Font Families:**
- Primary: Inter (500, 600, 700 weights)
- Accent/Numbers: Space Grotesk (for stats, bold statements)

**Hierarchy:**
- Hero Headlines: text-6xl md:text-7xl, font-bold, tracking-tight, leading-none
- Section Headers: text-3xl md:text-5xl, font-semibold
- Subsections: text-2xl font-semibold
- Card Titles: text-lg md:text-xl font-semibold
- Stats/Numbers: text-3xl md:text-5xl font-bold (Space Grotesk)
- Body Text: text-base md:text-lg font-medium, leading-relaxed
- Labels/Metadata: text-xs uppercase tracking-wider font-medium

---

## Layout System

**Spacing Units:** Tailwind 4, 6, 8, 12, 16, 20 for consistent rhythm

**Grid Patterns:**
- Streamer Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Stats Dashboard: grid-cols-2 lg:grid-cols-4 gap-6
- Tribe/Guild Directory: grid-cols-1 lg:grid-cols-2 gap-6
- Activity Feed: Single column max-w-3xl centered

**Container Strategy:**
- Full-width sections with max-w-7xl containers
- Generous padding: py-16 md:py-24 for section breathing room
- Cards: rounded-2xl with subtle borders, no harsh shadows

---

## Component Library

### Navigation
- Sticky header with subtle backdrop blur
- Logo left, primary nav center, profile/points right
- Understated with natural dividers (not glowing borders)
- Mobile: Minimal hamburger with full-screen overlay menu

### Hero Section
- **Large Hero Image:** Full-width, 75vh height
- Image: Cinematic shot of focused streamer in dim-lit setup, warm desk lighting, natural atmosphere—NOT RGB rainbow chaos
- Treatment: Subtle gradient overlay (earthy dark at bottom for text legibility)
- Headline: Bold, concise value proposition
- Subheadline: Supporting context for struggling streamers
- CTA Buttons: Backdrop-blur with semi-transparent backgrounds, muted warm accent for primary
- Trust Indicators: "Join 2,400+ streamers building their tribe" in small text

### Tribe/Guild Cards
- Horizontal layout: Guild emblem/badge left, info right
- Guild name, member count, current challenge
- Muted terracotta accent line on left edge
- Entry requirements badge (subtle, not flashy)
- Hover: Minimal lift, no glow effects

### Streamer Dashboard Widgets
- Grid of refined metric cards: Followers Growth, Stream Hours, Points Earned, Tribe Rank
- Large numbers with context labels below
- Progress bars: Thin, subtle, earthy accent fill
- Weekly comparison arrows (understated)
- Recent achievements: Badge icons with natural spacing

### Leaderboard Component
- Clean ranked list, no excessive decoration
- Position numbers: Large but refined (Space Grotesk)
- Avatar, streamer name, tribe affiliation, points
- Top 3: Subtle burnt orange/terracotta accent borders (no trophies/medals overload)
- Current user: Highlighted row with muted accent background

### Community Feed
- Activity cards: Streamer unlocked achievement, hit milestone, joined tribe
- Timestamp, game context, small thumbnail
- Clean interaction buttons (like/comment) with minimal styling
- No distracting animations on scroll

### Rewards Catalog
- Grid layout with reward cards
- Unlock requirements clearly stated
- Points cost in large numbers
- Redemption status (locked/unlocked) with subtle visual differentiation
- No slot-machine aesthetic—premium product showcase instead

### Forms (Profile/Onboarding)
- Clean input fields with labels inside or above
- Toggle switches: Refined, not oversized
- Platform connection: Logo buttons with subtle borders
- Avatar upload with circular preview
- Success states: Brief accent flash, no confetti explosions

---

## Images

**Hero Section:**
- Full-width background: 2400x1350px minimum
- Content: Intimate streamer workspace with warm practical lighting—desk lamp glow, monitor illumination, natural shadows
- Mood: Focused, grounded, aspirational without being unattainable
- Treatment: Dark gradient overlay from bottom (80% opacity) to transparent top

**Streamer/Member Cards:**
- Profile images: High-quality headshots or streaming setup shots
- Aspect ratio: 1:1 for avatars, 16:9 for featured streamers
- Style: Authentic, natural lighting—no overly edited gaming promo aesthetic

**Tribe/Guild Badges:**
- Custom emblems/icons representing different gaming communities
- Style: Minimal, geometric, tribal-inspired symbols
- Use Heroicons or custom SVG placeholders

**Rewards Imagery:**
- Product shots: Gaming peripherals, branded merch, exclusive items
- Photography style: Clean, natural, product-focused (not neon-lit)

**Community Feed Thumbnails:**
- Small game thumbnails (64x64px) alongside activity posts
- Streamer avatars for social proof

---

## Page Structures

**Landing Page:**
1. Hero with background image, value prop, primary CTA
2. How It Works: 3-step visual process (icons + descriptions)
3. Featured Tribes/Guilds: 3-column grid showcasing communities
4. Streamer Success Stories: 2-column testimonial cards with authentic photos
5. Leaderboard Preview: Top 10 streamers with muted styling
6. Rewards Showcase: 3-4 featured rewards in grid
7. Benefits Section: Community, growth tools, exclusive access
8. Final CTA: "Join the Tribe" with supporting text

**Dashboard (Logged In):**
- Stats Overview: 4-metric grid at top
- Active Challenges: Horizontal card carousel
- Tribe Activity Feed: Single column, max-w-3xl
- Personal Leaderboard Position: Compact widget
- Recent Streams: List view with thumbnails
- Upcoming Events: Calendar-style widget

**Tribe/Guild Detail Page:**
- Guild header: Emblem, name, member count, description
- Member directory: Grid of member cards
- Active challenges specific to this tribe
- Tribe leaderboard: Rankings within community
- Join/Leave CTA (context-dependent)

---

## Key Interactions

**Minimal Animation:**
- Card hover: Subtle translate-y-1 lift only
- Buttons: Opacity/background changes, no transforms
- Page loads: Simple fade-in
- No counters, no sparkles, no particle effects

**Visual Feedback:**
- Active states: Thin accent border or background tint
- Loading: Skeleton screens with natural gray tones
- Success: Brief accent color flash

---

## Design Priorities

1. **Grounded Sophistication:** Premium but accessible, refined without being sterile
2. **Tribal Community:** Guild identity central to experience, member connections visible
3. **Streamer-Focused:** Metrics and tools tailored for content creator growth
4. **Natural Hierarchy:** Data presented clearly without visual chaos
5. **Authentic Energy:** Street-credible and professional—exclusive club, not arcade