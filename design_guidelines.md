# GG Loop Design Guidelines

## Design Approach: Reference-Based (Gaming Platform)

**Selected References:** Discord, Twitch, Riot Games, Epic Games Store
**Key Principle:** Create an energetic, competitive gaming environment that celebrates achievement while maintaining accessibility for performance tracking.

**Design Direction:** Dark, immersive gaming aesthetic with vibrant accent highlights, bold typography, and data-rich components that emphasize player performance and community competition.

---

## Typography System

**Font Families:**
- Primary: Inter (600, 700, 800 weights for headings and UI)
- Secondary: JetBrains Mono (for stats, numbers, codes)

**Hierarchy:**
- Hero Headlines: text-5xl to text-7xl, font-bold tracking-tight
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl font-semibold
- Stats/Numbers: text-2xl to text-4xl font-bold (JetBrains Mono)
- Body Text: text-base to text-lg font-medium
- Metadata: text-sm to text-xs font-medium, uppercase tracking-wide

---

## Layout System

**Spacing Units:** Tailwind 4, 6, 8, 12, 16 (p-4, gap-6, mt-8, py-12, mb-16)

**Grid Patterns:**
- Game Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Leaderboard: Single column with ranked list items
- Stats Dashboard: grid-cols-2 md:grid-cols-4 gap-4
- Community Feed: grid-cols-1 lg:grid-cols-3 (main feed + sidebar)

**Container Strategy:**
- Full-width sections with max-w-7xl inner containers
- Cards and panels: rounded-xl with backdrop effects
- Dashboard widgets: Varied heights based on content, no forced viewport constraints

---

## Component Library

### Navigation
- Sticky top header with logo, primary nav links, user avatar/points display
- Transparent background with blur effect when scrolling
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- Full-width banner showcasing platform value proposition
- Large hero image: Dynamic gaming montage or featured tournament scene
- Overlay gradient for text readability
- Primary CTA buttons with blurred backgrounds (backdrop-blur-md bg-white/20)
- Stats ticker: "X Players • Y Games • Z Rewards Claimed"

### Game Library Cards
- Thumbnail image with game logo overlay
- Title, category badge, player count
- Quick stats: avg. score, active challenges
- Hover: Lift effect with glow accent

### Leaderboard Component
- Ranked list with position numbers (large, bold)
- Player avatar, username, score/points
- Trophy icons for top 3 positions
- Time filter tabs (Daily/Weekly/All-Time)
- Highlight current user's row with accent border

### Stats Dashboard
- Grid of metric cards (Games Played, Total Points, Rank, Win Rate)
- Large numbers with labels
- Progress bars for level/tier advancement
- Recent achievements carousel

### Community Feed
- Activity cards with user actions (achievements unlocked, high scores)
- Timestamp and game context
- Like/comment interactions
- Trending section sidebar

### Rewards/Points Display
- Prominent points counter in header
- Rewards catalog grid with unlock requirements
- Badge collection showcase
- Redemption history

### Forms (Profile/Settings)
- Grouped sections with clear labels
- Toggle switches for preferences
- Avatar upload with preview
- Gaming platform connection buttons (Steam, Epic, etc.)

---

## Images

**Hero Section:**
- Large background image: Epic gaming action shot or esports arena atmosphere
- Dimensions: Full-width, 70vh height on desktop
- Treatment: Gradient overlay (dark bottom to transparent top) for text contrast

**Game Cards:**
- Thumbnail images for each supported game
- Aspect ratio: 16:9
- Style: Official game artwork or screenshots

**User Avatars:**
- Circular with border accent
- Placeholder: Gaming-themed default avatars

**Achievement Badges:**
- Icon-based with trophy/medal designs
- Use icon library placeholders or simple SVG shapes

**Community Feed:**
- Small game thumbnails alongside activity posts
- User avatars for social proof

---

## Key Interactions

**Minimal Animation Strategy:**
- Card hover: Subtle lift (translate-y-1) with shadow increase
- Button states: Opacity changes, no complex transitions
- Page transitions: Simple fade-in for new content
- Stats counters: No animated counting on load

**Visual Feedback:**
- Active states: Accent border glow
- Loading states: Skeleton screens for data-heavy components
- Success actions: Brief accent flash, no lengthy animations

---

## Page Structures

**Landing Page:**
1. Hero with platform overview and CTA
2. Featured games grid (3-column)
3. How It Works (3-step process with icons)
4. Live leaderboard preview
5. Community highlights
6. Rewards showcase
7. Final CTA section

**Dashboard (Logged In):**
- Top stats overview (4-metric grid)
- Active challenges panel
- Recent games played list
- Leaderboard widget
- Community feed column

**Game Detail Page:**
- Game header with image and metadata
- Active challenges for this game
- Player's stats for this game
- Game-specific leaderboard
- Connect/Link account CTA

---

## Design Priorities

1. **Data Hierarchy:** Performance stats and leaderboards are primary focus
2. **Achievement Celebration:** Badges and rewards prominently displayed
3. **Community Presence:** Social proof throughout (player counts, recent activities)
4. **Clear CTAs:** Game connection and reward redemption paths obvious
5. **Competitive Energy:** Bold typography and vibrant accents create urgency