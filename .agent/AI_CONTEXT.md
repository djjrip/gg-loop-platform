# 🤖 AI Assistant Context - GG Loop Platform

> **Purpose:** This file provides complete context for ANY AI assistant (VS Code, GitHub Copilot, Antigravity, etc.) to understand and continue work on this project.

---

## 👤 Project Owner

**Name:** Jayson Quindao  
**Company:** GG LOOP LLC  
**Technical Level:** Non-technical (requires AI assistance for all coding tasks)  
**Coding Style:** "Vibe coding" with AI assistance

---

## 🎯 Project Overview

**GG Loop Platform** - A gaming rewards platform that allows users to earn points and coins through League of Legends gameplay.

### Core Technology Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (via Drizzle ORM)
- **Session Storage:** Redis
- **Deployment:** Railway
- **Monitoring:** Prometheus + Grafana + Loki (Docker-based)

### Live Deployment
- **Production URL:** https://ggloop.io
- **Platform:** Railway
- **Database:** Railway PostgreSQL

---

## 🏗️ Architecture

### Frontend (`client/`)
- React SPA with React Router
- TailwindCSS for styling
- OAuth integration (Google, Discord, Twitch)
- Riot API for League of Legends data

### Backend (`server/`)
- Express.js API
- PostgreSQL database via Drizzle ORM
- Redis for session management
- OAuth providers configured

### Monitoring (`monitoring/`)
- **Prometheus** - Metrics collection (Port 9090)
- **Grafana** - Dashboards (Port 3030, admin/admin)
- **Loki** - Log aggregation (Port 3100)
- **Promtail** - Log shipping

---

## 🔑 Critical Information

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# Riot API
RIOT_API_KEY=...

# Session
SESSION_SECRET=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

---

## 📁 Key Files & Directories

### Configuration
- `package.json` - Dependencies and scripts
- `docker-compose.yml` - Full stack orchestration
- `.env` - Environment variables (not committed)
- `nixpacks.toml` - Railway build config

### Database
- `shared/schema.ts` - Database schema (Drizzle)
- `server/storage.ts` - Database operations
- `server/migrations/` - Database migrations

### Routing
- `server/routes.ts` - Main API routes
- `server/routes/admin.ts` - Admin routes
- `client/src/App.tsx` - Frontend routes

### Key Features
- `server/founderControls.ts` - Admin founder controls
- `server/monitoring.ts` - Metrics and monitoring
- `client/src/pages/admin/` - Admin dashboards

---

## 🚀 Quick Start Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (port 5000)
npm run build           # Build for production
```

### Docker Monitoring
```bash
START_MONITORING.bat                    # Start all monitoring
CHECK_MONITORING.ps1                    # Health check
docker-compose up -d prometheus grafana # Start specific services
```

### Database
```bash
npm run db:push         # Push schema changes
npm run db:studio       # Open Drizzle Studio
```

---

## 🎨 Design System

### Theme: "Predator / Empire Command Center"
- **Primary Colors:** Neon green (#00ff41), dark backgrounds
- **Style:** Tactical HUD aesthetic, sci-fi hunter theme
- **Font:** Futuristic, clean
- **Effects:** Glassmorphism, glow effects, animations

### Key Components
- Lava lamp background animations
- Glassmorphic cards
- Neon accents and borders
- Tactical grid overlays

---

## 🐛 Known Issues & Solutions

### Google OAuth "Date Serialization" Error
**Solution:** Use `sql\`NOW()\`` instead of `new Date()` in database queries

### Discord OAuth Issues
**Status:** Routes currently disabled due to persistent errors

### Railway Build Issues
**Common Fix:** Check `package.json` and `nixpacks.toml` for missing dependencies

---

## 📊 Current Status (as of Dec 4, 2025)

### ✅ Working
- ✅ Local development server
- ✅ Railway deployment
- ✅ Google OAuth login
- ✅ Twitch OAuth login
- ✅ Monitoring stack (Prometheus + Grafana)
- ✅ Admin dashboard and controls
- ✅ Riot API integration
- ✅ PayPal integration

### 🚧 In Progress
- Loki log aggregation (starting up)
- Discord OAuth (disabled temporarily)

### 📝 Future Enhancements
- Real-time game tracking
- Advanced analytics
- Mobile app
- Additional payment methods

---

## 🎯 AI Assistant Instructions

### When Continuing Work:
1. **Always read this file first** to understand project context
2. **Check `WAKE_UP_README.md`** for session startup procedures
3. **Review `TIME_CONSTRAINTS.md`** for deadlines
4. **Follow existing code patterns** (TypeScript, async/await, error handling)
5. **Test locally before deploying** to Railway
6. **User is non-technical** - provide clear, simple explanations

### Code Style:
- TypeScript with strict typing
- Async/await over promises
- Detailed error logging
- Comments for complex logic
- RESTful API design

### Deployment Process:
1. Test locally with `npm run dev`
2. Build with `npm run build`
3. Commit changes to git
4. Push to main branch
5. Railway auto-deploys

---

## 🔗 Related Documentation

- `README.md` - Project overview
- `WAKE_UP_README.md` - Session startup guide
- `monitoring/README.md` - Monitoring stack docs
- `TIME_CONSTRAINTS.md` - Critical deadlines
- `START_SERVER.md` - Server startup guide

---

## 📞 Support & Resources

- **Railway Dashboard:** https://railway.app
- **Grafana:** http://localhost:3030 (local)
- **Prometheus:** http://localhost:9090 (local)
- **Production Site:** https://ggloop.io

---

**Last Updated:** 2025-12-04 22:56 CST  
**AI Session:** Antigravity  
**Next AI:** Ready for VS Code / GitHub Copilot / any AI assistant
