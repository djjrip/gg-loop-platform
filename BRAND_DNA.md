# GG LOOP OFFICIAL BRAND DNA

**[IMMUTABLE - DO NOT OVERRIDE WITHOUT EXPLICIT APPROVAL FROM FOUNDER]**

This document defines the permanent brand identity for GG Loop LLC. All UI/UX changes must conform to this specification.

---

## 🎨 BRAND COLORS (OFFICIAL PALETTE)

### Primary Colors
- **Orange:** `#ff7a28` - Primary brand color for CTAs, highlights, and key elements
- **Rose-Gold:** `#d77a47` - Secondary highlights and accents
- **Black:** `#000000` - Pure black for backgrounds
- **Dark Shadow:** `#0d0d0d` - Subtle dark backgrounds

### Supporting Colors
- **Orange Light:** `#ff9445` - Hover states
- **Orange Dark:** `#e6691a` - Pressed states  
- **Neon Glow:** `rgba(255, 122, 40, 0.3)` - Glow effects

### Forbidden Colors
- ❌ **NO Bronze/Copper tones** (e.g., #C08261, #8B6F47)
- ❌ **NO Green on public pages** (green is admin-only Empire theme)

---

## ✍️ TYPOGRAPHY

### Requirements
- **Sans-serif ONLY** - Bold, clean, aggressive
- **NO serif fonts EVER**
- Large headlines for impact
- Aggressive tracking and spacing

### Font Hierarchy
```
Headings: Bold sans-serif
Body: Regular sans-serif
Mono: Only for code/technical displays (admin)
```

---

## 🎯 BRAND AESTHETIC

### Core DNA
- **Esports energy** - Fast, competitive, high-stakes
- **Sneaker culture** - Urban, collectible, exclusive
- **Basketball energy** - Teamwork, skill, rewards
- **Urban-streetwear-meets-gaming** - Bold, modern, authentic

### Visual Style
- Valorant-style subtle glows
- Clean outlines and card shadows
- Neon tactical HUD accents (orange, not green)
- Modern, aggressive, professional

---

## 🔥 HERO SECTION (HOMEPAGE)

### Required Elements
```
"PLAY. EARN. LOOP."
```

- Black background
- **Orange highlight on "EARN"** (signature element)
- Neon HUD glow (orange)
- Large sans-serif text
- Centered CTA
- Controller infinity-loop logo visible

### Hero Structure
```tsx
<h1>
  <span className="text-white">PLAY. </span>
  <span className="text-ggloop-orange ggloop-glow-text">EARN. </span>
  <span className="text-white">LOOP.</span>
</h1>
```

---

## 🔘 BUTTON STYLES

### Official Button Design
- **Rounded corners**
- **Bold text**
- **Orange gradient** background
- **Glowing hover states** (orange neon glow)

### Example
```tsx
<button className="
  bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold
  hover:shadow-[0_0_20px_var(--ggloop-neon-glow)]
  rounded-lg px-6 py-3 font-bold text-white
">
  Get Started
</button>
```

---

## 🃏 CARD DESIGN

### Card Structure
- **Black/dark-shadow backgrounds**
- **Orange or rose-gold borders**
- **Subtle glows and shadows**
- Clean, modern, not overly tactical

---

## 🎮 CONTROLLER INFINITY-LOOP LOGO

### Requirements
- Must appear as anchor element across all pages
- Visible in navigation or hero
- Reinforces brand identity
- **File:** `/client/src/assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png`

---

## 🚫 FORBIDDEN DESIGN PATTERNS

### Never Use
- ❌ Serif fonts
- ❌ Bronze/copper color schemes
- ❌ Generic SaaS layouts
- ❌ Green colors on public pages (admin only)
- ❌ Redesigns that contradict GG LOOP DNA

---

## 🔒 THEME ENFORCEMENT

### Tailwind Config
All brand colors are defined in `tailwind.config.ts` under `ggloop` key:
```typescript
ggloop: {
  orange: "#ff7a28",
  "rose-gold": "#d77a47",
  black: "#000000",
  "dark-shadow": "#0d0d0d",
  // ...
}
```

### CSS Variables
GG LOOP variables in `client/src/index.css`:
```css
:root {
  --ggloop-orange: #ff7a28;
  --ggloop-rose-gold: #d77a47;
  --ggloop-neon-glow: rgba(255, 122, 40, 0.3);
}
```

### Empire Theme Scoping
Green Empire theme is **admin-only** and scoped to `.empire-layout` class:
```css
.empire-layout {
  --empire-green: #00ff41;
  /* ... */
}
```

---

## 📋 COMPONENT CHECKLIST

When creating new components:
- [ ] Uses `ggloop-orange` for primary actions
- [ ] Uses `ggloop-rose-gold` for highlights
- [ ] Black or dark-shadow backgrounds
- [ ] Sans-serif typography only
- [ ] Orange gradient buttons with glow
- [ ] No green colors (unless admin page)

---

## ✅ VERIFICATION

Before deploying any UI changes:
1. Check colors match official palette
2. Verify no serif fonts used
3. Confirm "PLAY. EARN. LOOP." hero intact
4. Ensure orange highlight on "EARN"
5. Validate controller logo visible
6. Test orange gradient buttons with glow
7. Confirm no green on public pages

---

**This is the permanent brand identity. Any deviations require explicit founder approval.**
