# GG LOOP - MAIN README

**Gaming Rewards Platform** | NBA Performance Culture | Homeownership Through Gaming

[![Deployment](https://img.shields.io/badge/Deployment-Homelab-green)](https://ggloop.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏀 WHAT IS GG LOOP?

GG Loop is the first platform that combines:
- **Gaming rewards** (immediate value for your time)
- **Financial empowerment** (bills, investing, stability)
- **Wellness culture** (athlete mindset, balance)
- **Fashion & identity** (digital tunnel-walk)
- **Homeownership vision** (earn your way to a house)

**Gaming is the only universal sport.** We reward excellence, respect humanity, and build a path from groceries to property ownership.

---

## 🚀 LIVE SITE

**Production:** https://ggloop.io  
**Deployment:** Self-hosted Homelab (Docker Compose)  
**Status:** Operational 24/7

### Key Pages:
- **Main:** https://ggloop.io
- **Roadmap:** https://ggloop.io/roadmap
- **Subscribe:** https://ggloop.io/subscription
- **Shop:** https://ggloop.io/shop

---

## 🏗️ ARCHITECTURE

### Stack:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Cache:** Redis
- **Deployment:** Docker Compose (Homelab)
- **Proxy:** Caddy (automatic HTTPS)
- **Monitoring:** Prometheus + Grafana + Loki

### Services (11 Total):
| Service | Purpose | Port |
|---------|---------|------|
| Caddy | Reverse proxy + SSL | 80, 443 |
| ggloop-app | Main application | 3000 |
| PostgreSQL | Database | 5432 |
| Redis | Cache + sessions | 6379 |
| Antisocial Bot | Marketing automation | 3001 |
| Empire Hub | Admin dashboard | 8080 |
| Prometheus | Metrics | 9090 |
| Grafana | Visualization | 3030 |
| Loki | Logs | 3100 |
| Promtail | Log shipping | - |
| AutoHeal | Container recovery | - |

**All services auto-restart, health-checked, monitored.**

---

## 💻 LOCAL DEVELOPMENT

### Prerequisites:
- Node.js 20+
- Docker + Docker Compose
- Git

### Quick Start:
```bash
# Clone repo
git clone https://github.com/djjrip/gg-loop-platform
cd gg-loop-platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start dev server
npm run dev
```

Visit: http://localhost:5000

---

## 🏠 HOMELAB DEPLOYMENT

### Start Production Stack:
```bash
# Windows
START-HOMELAB.bat

# Manual
docker-compose -f docker-compose.homelab.yml up -d
```

### Stop Production Stack:
```bash
STOP-HOMELAB.bat
```

### View Logs:
```bash
docker-compose -f docker-compose.homelab.yml logs -f
```

### Check Status:
```bash
docker-compose -f docker-compose.homelab.yml ps
```

**See:** `HOMELAB_DEPLOYMENT.md` for complete guide.

---

## ☁️ AWS DEPLOYMENT (Future)

AWS-ready templates available in `infra/aws/`:
- Docker Compose for EC2
- ECS/Fargate task definitions
- GitHub Actions CI/CD workflow

**Cost:** ~$60-175/month (when scaling needed)

**See:** `infra/aws/README.md` for details.

---

## 🧪 TESTING

```bash
# Run all tests
npm test

# Build production bundle
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

**Full testing checklist:** see `TESTING_CHECKLIST.md`

---

## 📖 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| `HOMELAB_DEPLOYMENT.md` | Complete homelab setup guide |
| `DEPLOYMENT_ARCHITECTURE_COMPLETE.md` | Infrastructure overview |
| `RAILWAY_DEPRECATION_NOTICE.md` | Why Railway was removed |
| `TESTING_CHECKLIST.md` | Testing procedures |
| `AWS_MEETING_PREP_COMPLETE.md` | AWS partnership materials |

---

## 🔑 ENVIRONMENT VARIABLES

Key variables needed (see `.env.homelab` for full list):

```bash
# Database
DATABASE_URL=postgresql://empire:password@postgres:5432/ggloop_production
REDIS_URL=redis://default:password@redis:6379

# Security
SESSION_SECRET=your-64-char-random-string

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-secret
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-secret

# Gaming APIs
RIOT_API_KEY=your-riot-api-key

# Payment
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=live

# Domain
BASE_URL=https://ggloop.io
```

---

## 🤝 CONTRIBUTING

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📜 LICENSE

MIT License - see `LICENSE` file

---

## 🌐 CONNECT

- **Website:** https://ggloop.io
- **Empire Hub:** http://localhost:8080 (when running locally)
- **GitHub:** https://github.com/djjrip/gg-loop-platform

---

## 🎯 ROADMAP

**See live roadmap:** https://ggloop.io/roadmap

**4 Tiers:**
1. **Immediate Rewards** (Now) - Groceries, bills, fashion
2. **Digital Athlete Era** (M1-8) - Wellness, tunnel culture
3. **Financial Empowerment** (M9-18) - Investing, stability
4. **Homeownership Era** (Y2+) - First house earned through gaming

---

**Built with ❤️ by the GG Loop Empire**  
**Deployment:** Homelab (Primary) | AWS (Future Scale)  
**Status:** Production-Ready | Self-Hosted | $0/month
