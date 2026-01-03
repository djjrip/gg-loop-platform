# GG LOOP - CORE PRODUCTION MANIFEST

**This repository is the ONLY production system for GG LOOP LLC.**

---

## CANONICAL TRUTH

**Company:** GG LOOP LLC  
**Product:** GG LOOP (Play → Earn → Loop)  
**Domain:** https://ggloop.io  
**Repository:** djjrip/gg-loop-platform  
**Status:** CORE_PRODUCTION (ACTIVE)

---

## WHAT THIS REPOSITORY IS

This is the **single, monolithic, full-stack application** that powers ggloop.io.

**Architecture:**
- Frontend: React + Vite (client/)
- Backend: Express + TypeScript (server/)
- Shared: TypeScript schemas (shared/)
- Database: PostgreSQL
- Deployment: AWS App Runner (backend) + AWS Amplify (frontend)

**Purpose:**
- Competitive gaming rewards platform
- Users play League of Legends / Valorant
- Users earn points for gameplay
- Users redeem rewards (gift cards, subscriptions)

---

## WHAT THIS REPOSITORY IS NOT

**NOT a microservices architecture**  
**NOT a multi-repo system**  
**NOT experimental code**  
**NOT a side project**  
**NOT blockchain/crypto**  
**NOT options trading**  
**NOT a portfolio site**

---

## OTHER REPOSITORIES

**ggloop-web:** ARCHIVED (deprecated, no future use)  
**All other djjrip repos:** OUT_OF_SCOPE (separate projects)

**DO NOT:**
- Merge code from other repositories
- Import logic from other projects
- Cross-link between repositories
- Treat any other repo as part of GG LOOP production

---

## DEPLOYMENT TARGET

**Primary:** AWS (App Runner + Amplify)  
**Temporary:** Railway (deprecated, migrating off)  
**NOT:** Vercel, Netlify, Heroku, or any other platform

---

## MAINTENANCE LEVEL

**Current Level:** Level 1 (Sanitation, Alignment, Stability)

**Allowed:**
- Bug fixes
- Documentation
- Cleanup
- Organization

**NOT Allowed (Without Founder Approval):**
- New features
- Architecture changes
- Refactors
- Redesigns
- Infrastructure changes
- Database schema changes

---

**Last Updated:** 2025-12-31  
**Status:** Cleanup Phase Complete - Frozen for Stability
