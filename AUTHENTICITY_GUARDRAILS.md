# ✅ AUTHENTICITY GUARDRAILS

## CRITICAL: This is a REAL Business

All automation, reports, and metrics MUST use REAL data from the database. No fake numbers, no test data, no examples.

---

## 🔒 AUTHENTICITY RULES

### 1. Database Queries Only
✅ **CORRECT:**
```typescript
const [revenue] = await db
  .select({ total: sql<number>`SUM(amount)` })
  .from(pointTransactions)
  .where(gte(createdAt, today));
```

❌ **WRONG:**
```typescript
const revenue = 1250; // Hardcoded example
const revenue = mockRevenue(); // Test data
```

### 2. Real User Counts
✅ **CORRECT:**
```typescript
const [users] = await db
  .select({ count: sql<number>`count(*)` })
  .from(users);
```

❌ **WRONG:**
```typescript
const userCount = 156; // Example number
```

### 3. Real Redemption Data
✅ **CORRECT:**
```typescript
const claims = await db
  .select()
  .from(rewardClaims)
  .where(eq(status, 'pending'));
```

❌ **WRONG:**
```typescript
const claims = [{ id: 'example', status: 'pending' }]; // Mock data
```

### 4. Calculated Metrics
✅ **CORRECT:**
```typescript
const conversionRate = totalUsers > 0 
  ? (paidUsers / totalUsers) * 100 
  : 0;
```

❌ **WRONG:**
```typescript
const conversionRate = 5.2; // Example percentage
```

---

## 🚫 NEVER DO THIS

1. ❌ Hardcode example numbers in reports
2. ❌ Use mock/test data in production
3. ❌ Create fake transactions for demos
4. ❌ Show "example" metrics to users
5. ❌ Use placeholder data in calculations

---

## ✅ ALWAYS DO THIS

1. ✅ Query database for all metrics
2. ✅ Calculate from real data
3. ✅ Handle empty states gracefully (0 users = 0, not fake data)
4. ✅ Show "No data yet" instead of fake numbers
5. ✅ Use environment variables for config (never hardcode)

---

## 🔍 VERIFICATION CHECKLIST

Before deploying any automation:

- [ ] All revenue numbers come from `pointTransactions` table
- [ ] All user counts come from `users` table
- [ ] All redemption data comes from `rewardClaims` table
- [ ] All calculations use real database queries
- [ ] No hardcoded example numbers
- [ ] No mock/test data in production code
- [ ] Empty states show 0 or "No data", not fake numbers
- [ ] All metrics are calculated, not assumed

---

## 📊 EXAMPLE: Authentic Business Report

✅ **CORRECT:**
```
Revenue This Month: $1,250.00 (from actual transactions)
Total Users: 156 (from users table)
Active Users: 42 (calculated from lastLoginAt)
Pending Redemptions: 2 (from rewardClaims where status='pending')
```

❌ **WRONG:**
```
Revenue This Month: $1,250.00 (example)
Total Users: 156 (estimated)
Active Users: 42 (projected)
Pending Redemptions: 2 (sample)
```

---

## 🎯 CURRENT IMPLEMENTATION STATUS

### ✅ Already Authentic:
- `server/businessAutomation.ts` - Uses real database queries
- `server/revenueOptimizer.ts` - Calculates from real data
- All reports pull from actual tables

### ⚠️ Needs Verification:
- Browser automation (uses env vars, but verify no hardcoded data)
- Email templates (should use real data, not examples)
- Dashboard displays (verify all numbers are real)

---

**Remember: This is a REAL business. Every number must be REAL.** ✅

