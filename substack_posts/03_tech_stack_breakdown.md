# Building a Full-Stack Gaming Platform: Tech Stack Breakdown

**Series:** Building GG Loop  
**Published:** [Date]  
**Reading Time:** 8 minutes

---

Most gaming platforms are black boxes. You have no idea how they work, what tech they use, or why they make certain decisions.

I'm doing the opposite.

Here's the complete tech stack behind GG Loop: what we use, why we chose it, and what we'd do differently.

---

## The Stack at a Glance

**Frontend:**
- React 18.3.1
- TypeScript 5.3
- Vite 5.0
- TailwindCSS 3.4
- Radix UI
- TanStack React Query

**Backend:**
- Node.js 20+
- Express.js 4.18
- TypeScript 5.3
- Drizzle ORM 0.29

**Database:**
- PostgreSQL 15
- Neon (serverless Postgres)

**Hosting & Infrastructure:**
- Railway (application hosting)
- Cloudflare (CDN, DNS)
- Neon (database hosting)

**Payments:**
- PayPal SDK
- Stripe (future)

**APIs & Integrations:**
- Riot Games API
- Twitch API
- Discord API
- Google OAuth
- Discord OAuth
- Twitch OAuth

**Development Tools:**
- Git + GitHub
- VS Code
- ESLint + Prettier
- Drizzle Kit (migrations)

---

## Frontend: React 18 + TypeScript

### Why React 18?

**Pros:**
- ✅ Mature ecosystem (tons of libraries)
- ✅ Server Components (future-ready)
- ✅ Concurrent rendering (better performance)
- ✅ Huge community (easy to find help)

**Cons:**
- ❌ Bundle size can get large
- ❌ Requires build step (not as simple as vanilla JS)

**Why we chose it:** I know React well. Fast development. Huge ecosystem. Easy to hire React devs in the future.

**Would I choose it again?** Yes. React is still the best choice for complex UIs with lots of state management.

---

### Why TypeScript?

**Pros:**
- ✅ Catch bugs before runtime
- ✅ Better autocomplete in VS Code
- ✅ Self-documenting code (types as documentation)
- ✅ Easier refactoring

**Cons:**
- ❌ Steeper learning curve
- ❌ More boilerplate
- ❌ Build step required

**Why we chose it:** I've been burned by JavaScript bugs too many times. TypeScript catches 80% of bugs before they hit production.

**Would I choose it again?** 100% yes. TypeScript is non-negotiable for any serious project.

---

### Why Vite?

**Pros:**
- ✅ Lightning-fast dev server (instant hot reload)
- ✅ Optimized production builds
- ✅ Simple configuration
- ✅ Native ESM support

**Cons:**
- ❌ Smaller ecosystem than Webpack
- ❌ Some plugins not compatible

**Why we chose it:** Create React App is dead. Vite is the future. Fast dev experience = faster iteration.

**Would I choose it again?** Yes. Vite is a game-changer for DX (developer experience).

---

### Why TailwindCSS?

**Pros:**
- ✅ Utility-first (no context switching)
- ✅ Consistent design system
- ✅ No CSS file bloat
- ✅ Mobile-first responsive design

**Cons:**
- ❌ HTML can get verbose
- ❌ Learning curve for utility classes

**Why we chose it:** I hate writing CSS. Tailwind lets me style components without leaving JSX.

**Would I choose it again?** Yes. Tailwind is the fastest way to build good-looking UIs.

---

## Backend: Express + TypeScript

### Why Express.js?

**Pros:**
- ✅ Simple and minimal
- ✅ Huge ecosystem (middleware for everything)
- ✅ Easy to understand
- ✅ Works with any database

**Cons:**
- ❌ No built-in structure (you have to organize yourself)
- ❌ Callback hell (if you're not careful)

**Why we chose it:** I needed something simple and flexible. Express gets out of your way and lets you build.

**Would I choose it again?** Maybe. I'd consider Fastify (faster) or Hono (modern) for the next project.

---

### Why Drizzle ORM?

**Pros:**
- ✅ TypeScript-first (full type safety)
- ✅ SQL-like syntax (easy to learn)
- ✅ Lightweight (no bloat)
- ✅ Great migrations system

**Cons:**
- ❌ Smaller community than Prisma
- ❌ Fewer resources/tutorials

**Why we chose it:** Prisma is great but heavy. Drizzle is lightweight, TypeScript-first, and gives you full control over SQL.

**Would I choose it again?** Yes. Drizzle is underrated. Best ORM for TypeScript projects.

---

## Database: PostgreSQL + Neon

### Why PostgreSQL?

**Pros:**
- ✅ Rock-solid reliability
- ✅ ACID compliance (data integrity)
- ✅ JSON support (flexible schema)
- ✅ Full-text search
- ✅ Huge ecosystem

**Cons:**
- ❌ Requires more setup than SQLite
- ❌ Scaling can be complex

**Why we chose it:** PostgreSQL is the industry standard. Reliable, powerful, and works with every hosting provider.

**Would I choose it again?** Yes. Postgres is the safe choice.

---

### Why Neon?

**Pros:**
- ✅ Serverless (pay for what you use)
- ✅ Instant branching (like Git for databases)
- ✅ Auto-scaling
- ✅ Free tier (generous)

**Cons:**
- ❌ Newer service (less proven than AWS RDS)
- ❌ Cold starts (if database is idle)

**Why we chose it:** Railway's built-in Postgres was expensive ($20/month). Neon is free for small projects and scales automatically.

**Would I choose it again?** Yes. Neon is perfect for startups. Cheap, fast, and scales when you need it.

---

## Hosting: Railway

### Why Railway?

**Pros:**
- ✅ Dead simple deployment (connect GitHub, deploy)
- ✅ Auto-deploy on push
- ✅ Environment variables management
- ✅ Logs and monitoring built-in

**Cons:**
- ❌ More expensive than Vercel/Netlify
- ❌ No edge functions (yet)

**Why we chose it:** I needed full-stack hosting (frontend + backend). Railway makes it stupid simple.

**Would I choose it again?** Yes for now. But I'd consider Fly.io or Render for better pricing at scale.

---

## Payments: PayPal

### Why PayPal?

**Pros:**
- ✅ Users trust PayPal
- ✅ Subscriptions built-in
- ✅ Good documentation
- ✅ Fraud protection

**Cons:**
- ❌ Higher fees than Stripe (3.49% + $0.49)
- ❌ Clunky API
- ❌ Slower payouts

**Why we chose it:** Users trust PayPal more than "some random gaming site." Trust = conversions.

**Would I choose it again?** For now, yes. But I'll add Stripe as an alternative soon.

---

## APIs: Riot, Twitch, Discord

### Riot Games API

**What we use it for:**
- Fetch player stats (rank, wins, KDA)
- Calculate points based on performance
- Verify account ownership

**Challenges:**
- Rate limits (strict)
- Production key approval process (slow)
- API can be unreliable during patches

**Lessons learned:** Always cache API responses. Don't hit Riot's API on every page load.

---

### Twitch API

**What we use it for:**
- OAuth login
- Fetch streamer stats
- Verify Twitch accounts

**Challenges:**
- OAuth flow is complex
- Token expiration (need refresh tokens)

**Lessons learned:** Use a library (Passport.js) for OAuth. Don't roll your own.

---

### Discord API

**What we use it for:**
- OAuth login
- Assign Discord roles (rewards)
- Send notifications to Discord server

**Challenges:**
- Bot permissions can be confusing
- Rate limits

**Lessons learned:** Discord's API is well-documented. Use their official SDK.

---

## What I'd Do Differently

### 1. Use Monorepo from Day 1
**Problem:** Frontend and backend are in the same repo but not properly organized.  
**Solution:** Use Turborepo or Nx for better monorepo management.

### 2. Add End-to-End Tests Earlier
**Problem:** No E2E tests = bugs slip through.  
**Solution:** Use Playwright for E2E tests from the start.

### 3. Use Stripe Instead of PayPal
**Problem:** PayPal's API is clunky and fees are higher.  
**Solution:** Stripe has better DX and lower fees. Should've started there.

### 4. Implement Feature Flags
**Problem:** Hard to roll out features gradually.  
**Solution:** Use LaunchDarkly or a simple feature flag system.

### 5. Set Up Monitoring Earlier
**Problem:** No visibility into errors until users report them.  
**Solution:** Use Sentry for error tracking from Day 1.

---

## The Numbers

**Lines of Code:** 50,000+  
**Components:** 100+  
**API Endpoints:** 150+  
**Database Tables:** 20+  
**Build Time:** ~45 seconds  
**Bundle Size:** 1.2 MB (gzipped)  
**Lighthouse Score:** 92/100

---

## What's Next

**This Week:**
- Add Stripe as payment alternative
- Implement feature flags
- Set up Sentry for error tracking

**This Month:**
- Migrate to monorepo (Turborepo)
- Add E2E tests (Playwright)
- Optimize bundle size (code splitting)

**This Year:**
- Build mobile app (React Native)
- Add real-time features (WebSockets)
- Scale to 100K users

---

## Want to See the Code?

I'm considering open-sourcing parts of GG Loop (not the core business logic, but the architecture and patterns).

**Would you be interested in:**
- [ ] Open-source starter template (React + Express + Drizzle)
- [ ] Architecture deep-dives (how we structure code)
- [ ] Video walkthroughs (code tours)

Drop a comment and let me know.

---

**Join the GG Loop Community:**
- Discord: [discord.gg/ggloop](https://discord.gg/ggloop)
- Platform: [ggloop.io](https://ggloop.io)
- Twitter: [@ggloop](https://twitter.com/ggloop)

**Subscribe for weekly dev logs** 👇

---

**Next post:** How We Built the Fulfillment System (1,200 Lines in 5 Hours)
