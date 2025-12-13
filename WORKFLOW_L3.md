# WORKFLOW - LEVEL 3
**Staging Branch Strategy for Safe Deployments**

**Created:** December 10, 2025  
**Purpose:** Stop hot-deploying to production, implement review-before-deploy workflow

---

## CURRENT PROBLEM

**What's Happening Now:**
- Agent (AG) pushes changes directly to `main` branch
- Railway auto-deploys `main` to production immediately
- No review step before changes go live
- Risk of bugs reaching users without CEO approval

**Recent Example:**
- Syntax errors in `routes.ts` caused 3 failed deployments
- PayPal button changes went live without manual testing
- Each push triggers a new Railway build (~2-3 minutes)

---

## PROPOSED SOLUTION: STAGING BRANCH WORKFLOW

### Branch Structure

```
main (production)
  ↑
  └── ggloop-staging (review branch)
        ↑
        └── feature branches (optional)
```

**Branch Purposes:**
- **`main`**: Production-ready code only. Railway auto-deploys this.
- **`ggloop-staging`**: Agent's default target. CEO reviews before merging to main.
- **Feature branches** (optional): For experimental work, not required for most changes.

---

## WORKFLOW STEPS

### For Agent (AG):

1. **Default Push Target:** Always push to `ggloop-staging` unless explicitly told otherwise.

   ```bash
   git checkout ggloop-staging
   git add .
   git commit -m "🔧 FEATURE: Description of changes"
   git push origin ggloop-staging
   ```

2. **Notify CEO:** After pushing to staging, use `notify_user` to inform CEO that changes are ready for review.

3. **Wait for Approval:** Do NOT merge to `main` automatically. CEO will review and merge manually.

### For CEO (Manual Steps):

1. **Review Changes:**
   ```bash
   git checkout ggloop-staging
   git pull origin ggloop-staging
   # Test locally or review code
   ```

2. **Merge to Main (when ready):**
   ```bash
   git checkout main
   git merge ggloop-staging
   git push origin main
   ```

3. **Railway Auto-Deploys:** Once `main` is pushed, Railway deploys automatically.

---

## IMPLEMENTATION PLAN

### Phase 1: Create Staging Branch (One-Time Setup)

**Agent will run:**
```bash
cd "c:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
git checkout -b ggloop-staging
git push -u origin ggloop-staging
```

**Result:** `ggloop-staging` branch created and pushed to GitHub.

### Phase 2: Update Agent Behavior (Immediate)

**Agent's new default workflow:**
1. Always check out `ggloop-staging` before making changes
2. Commit and push to `ggloop-staging`
3. Use `notify_user` to request CEO review
4. **NEVER** push directly to `main` unless explicitly instructed

### Phase 3: Railway Configuration (Optional)

**Current Setup:**
- Railway deploys from `main` branch only
- No changes needed to Railway config

**Future Enhancement (Optional):**
- Create a second Railway environment for `ggloop-staging`
- Deploy staging branch to `ggloop-staging.up.railway.app` for live testing
- Requires Railway Pro plan ($20/month)

---

## GIT COMMANDS REFERENCE

### Agent's Daily Workflow

```bash
# 1. Switch to staging branch
git checkout ggloop-staging

# 2. Pull latest changes
git pull origin ggloop-staging

# 3. Make changes (edit files)

# 4. Stage and commit
git add .
git commit -m "🔧 FEATURE: Description"

# 5. Push to staging
git push origin ggloop-staging

# 6. Notify CEO via notify_user tool
```

### CEO's Merge Workflow

```bash
# 1. Review staging branch
git checkout ggloop-staging
git pull origin ggloop-staging
# (test locally if needed)

# 2. Merge to main
git checkout main
git pull origin main
git merge ggloop-staging

# 3. Push to production
git push origin main
# (Railway auto-deploys)
```

### Emergency Hotfix (Direct to Main)

```bash
# Only for critical production bugs
git checkout main
git pull origin main
# (make fix)
git add .
git commit -m "🚨 HOTFIX: Description"
git push origin main
```

---

## COMMIT MESSAGE CONVENTIONS

**Agent should use these prefixes:**
- `🔧 FEATURE:` - New feature or enhancement
- `🐛 FIX:` - Bug fix
- `📝 DOCS:` - Documentation only
- `🎨 STYLE:` - UI/CSS changes
- `♻️ REFACTOR:` - Code restructuring
- `🚨 HOTFIX:` - Emergency production fix
- `🔒 SECURITY:` - Security-related change

**Example:**
```bash
git commit -m "🔧 FEATURE: Add email notifications for reward redemptions"
```

---

## ROLLBACK PROCEDURE

**If a bad deploy reaches production:**

```bash
# 1. Find last good commit
git log --oneline main

# 2. Revert to last good commit
git checkout main
git reset --hard <commit-hash>
git push origin main --force

# 3. Railway will auto-deploy the reverted version
```

**Alternative (safer):**
```bash
# Create a revert commit (preserves history)
git revert <bad-commit-hash>
git push origin main
```

---

## BENEFITS OF THIS WORKFLOW

✅ **CEO Control:** No changes go live without approval  
✅ **Testing Window:** Can test staging branch locally before deploying  
✅ **Rollback Safety:** Easy to revert if something breaks  
✅ **Audit Trail:** Clear git history of what was deployed when  
✅ **Agent Safety:** Agent can't accidentally break production  

---

## WHEN TO USE DIRECT MAIN PUSHES

**Only in these scenarios:**
1. **Emergency hotfix** for critical production bug
2. **CEO explicitly instructs** agent to push to main
3. **Trivial changes** like typo fixes in documentation (CEO's discretion)

**Default:** Always use staging branch unless told otherwise.

---

## NEXT STEPS (PENDING CEO APPROVAL)

1. ✅ **Review this workflow document**
2. ⏳ **CEO approves staging branch strategy**
3. ⏳ **Agent creates `ggloop-staging` branch**
4. ⏳ **Agent switches default push target to staging**
5. ⏳ **Test workflow with a small change**

**Status:** Awaiting CEO approval to implement.
