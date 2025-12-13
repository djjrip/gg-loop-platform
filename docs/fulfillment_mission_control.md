# Manual Fulfillment System + Founder Mission Control Dashboard
## Design Document (V1)

**Status:** Design for Review  
**Target Stack:** TypeScript, Drizzle ORM, PostgreSQL, React, Express  
**Deployment:** Railway (auto-deploy from GitHub)

---

## 1. Overview

**Purpose:** Enable founder (solo operator) to manually manage reward fulfillment at scale while tracking streamer performance and preventing financial overcommitment.

**Core Philosophy:**
- Simple, manual-first workflows (no external APIs in V1)
- Founder-centric "Mission Control" UI for high-level operational visibility
- Audit trail for all fulfillment decisions
- Extensibility for future API integrations (Tremendous, Stripe, etc.)

**Scope (V1):**
- [x] 6 reward types (GIFT_CARD_AMAZON, GIFT_CARD_STEAM, GIFT_CARD_RIOT, GROCERIES_DELIVERY, CASH_APP, PAYPAL)
- [x] Reward claims workflow (PENDING → IN_PROGRESS → FULFILLED/REJECTED)
- [x] Mission Control Dashboard with metrics, streamer breakdown, claims queue
- [x] Manual fulfillment notes & tracking
- [x] Audit logging for compliance
- [ ] External API integrations (future)

---

## 2. Data Model

### 2.1 New Database Tables

#### Table: `reward_types`
Configurable catalog of reward options available to players.

```typescript
export const rewardTypes = pgTable("reward_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),              // "Amazon Gift Card $25"
  description: text("description"),
  type: varchar("type").notNull(),              // GIFT_CARD_AMAZON, GIFT_CARD_STEAM, etc
  pointsCost: integer("points_cost").notNull(), // How many points to claim
  realValue: integer("real_value").notNull(),   // USD equivalent (cents)
  category: varchar("category").notNull(),      // "digital", "delivery", "cash"
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  fulfillmentType: varchar("fulfillment_type").notNull().default("manual"), // Future: "api"
  
  // Config for future API integration
  externalProviderId: varchar("external_provider_id"), // Tremendous, etc
  externalSkuId: varchar("external_sku_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Table: `reward_claims`
User claims for rewards; tracks fulfillment lifecycle.

```typescript
export const rewardClaims = pgTable("reward_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardTypeId: varchar("reward_type_id").notNull().references(() => rewardTypes.id),
  
  // Claim lifecycle
  status: varchar("status").notNull().default("pending"), // pending, in_progress, fulfilled, rejected
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  
  // Fulfillment data
  fulfillmentMethod: varchar("fulfillment_method"), // "email", "manual_code", "shipped", etc
  fulfillmentData: jsonb("fulfillment_data"),       // Flexible storage for fulfillment details
  // e.g., { "code": "XXXX-XXXX", "externalTransactionId": "...", "sentAt": "..." }
  
  fulfillmentNotes: text("fulfillment_notes"),       // Founder notes during fulfillment
  adminNotes: text("admin_notes"),                   // Internal notes about the claim
  
  // Tracking & metadata
  pointsSpent: integer("points_spent").notNull(),
  userEmail: varchar("user_email"),                 // Denormalized for faster lookup
  userDisplayName: varchar("user_display_name"),     // Denormalized for reports
  
  // Fulfillment audit
  fulfilledBy: varchar("fulfilled_by").references(() => users.id), // Admin who fulfilled
  fulfilledAt: timestamp("fulfilled_at"),
  rejectedReason: text("rejected_reason"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  
  // IP & User Agent for fraud tracking
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  idxClaimsStatus: index("idx_claims_status").on(table.status),
  idxClaimsUser: index("idx_claims_user").on(table.userId),
  idxClaimsDate: index("idx_claims_date").on(table.claimedAt),
  idxClaimsFulfilled: index("idx_claims_fulfilled").on(table.fulfilledAt),
}));
```

#### Table: `fulfillment_metrics`
Aggregated stats for Mission Control dashboard (updated daily/weekly).

```typescript
export const fulfillmentMetrics = pgTable("fulfillment_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Time period
  period: varchar("period").notNull(), // "2025-01-20" (daily), "2025-W03" (weekly)
  periodType: varchar("period_type").notNull(), // "daily", "weekly", "monthly"
  
  // Aggregate counts
  totalClaimsCreated: integer("total_claims_created").notNull().default(0),
  totalClaimsFulfilled: integer("total_claims_fulfilled").notNull().default(0),
  totalClaimsRejected: integer("total_claims_rejected").notNull().default(0),
  totalClaimsPending: integer("total_claims_pending").notNull().default(0),
  
  // Financial impact
  totalPointsSpent: integer("total_points_spent").notNull().default(0),
  totalUsdSpent: integer("total_usd_spent").notNull().default(0),   // cents
  
  // Breakdown by reward type (JSON for flexibility)
  claimsByType: jsonb("claims_by_type"), // { "GIFT_CARD_AMAZON": 12, "CASH_APP": 5, ... }
  
  // Streamer metrics (for multi-founder support in future)
  topStreamersByClaimsCount: jsonb("top_streamers_by_claims"),
  // [{ "streamerId": "...", "displayName": "...", "claimCount": 5 }, ...]
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqPeriod: sql`UNIQUE(period, period_type)`,
  idxMetricsDate: index("idx_metrics_period").on(table.period),
}));
```

#### Extend Existing Table: `users` (New columns)
```typescript
// Add to users table (if not already present):
isStreamer: boolean("is_streamer").notNull().default(false),
streamerDisplayName: varchar("streamer_display_name"),
streamerTwitchUrl: varchar("streamer_twitch_url"),
```

### 2.2 Schema Types (Zod Validation)

```typescript
export const insertRewardTypeSchema = createInsertSchema(rewardTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardClaimSchema = createInsertSchema(rewardClaims).omit({
  id: true,
  claimedAt: true,
  fulfilledAt: true,
  rejectedAt: true,
  updatedAt: true,
  fulfilledBy: true,
  rejectedBy: true,
});

export const updateRewardClaimSchema = z.object({
  status: z.enum(["pending", "in_progress", "fulfilled", "rejected"]),
  fulfillmentMethod: z.string().optional(),
  fulfillmentData: z.record(z.any()).optional(),
  fulfillmentNotes: z.string().optional(),
  rejectedReason: z.string().optional(),
});

export type InsertRewardType = z.infer<typeof insertRewardTypeSchema>;
export type RewardType = typeof rewardTypes.$inferSelect;

export type InsertRewardClaim = z.infer<typeof insertRewardClaimSchema>;
export type RewardClaim = typeof rewardClaims.$inferSelect;
export type UpdateRewardClaim = z.infer<typeof updateRewardClaimSchema>;
```

---

## 3. Backend Architecture

### 3.1 New Service Layer: `server/services/fulfillmentService.ts`

**Purpose:** Encapsulate business logic for reward claims and fulfillment.

```typescript
// Key methods:
export class FulfillmentService {
  // Create a new claim
  async createRewardClaim(
    userId: string,
    rewardTypeId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RewardClaim>

  // Update claim status (fulfill/reject)
  async updateClaimStatus(
    claimId: string,
    adminUserId: string,
    update: UpdateRewardClaim
  ): Promise<RewardClaim>

  // Get mission control metrics
  async getMissionControlMetrics(): Promise<{
    totalClaims: number,
    pendingClaims: number,
    totalUsdSpent: number,
    fulfillmentRate: number,
    topRewardTypes: { type: string, count: number }[],
    streamerMetrics: { userId: string, displayName: string, claimCount: number }[]
  }>

  // Get detailed metrics for a specific user
  async getUserClaimMetrics(userId: string): Promise<UserClaimMetrics>

  // Get all pending claims (ops queue)
  async getPendingClaims(limit?: number): Promise<RewardClaim[]>

  // Bulk update claims
  async bulkUpdateClaims(updates: BulkUpdate[]): Promise<void>
}
```

### 3.2 API Routes: `server/routes/admin.ts` Additions

**Endpoint Structure:**

```
GET    /admin/fulfillment/metrics              → Mission Control dashboard data
GET    /admin/fulfillment/claims               → List all claims (with filters)
POST   /admin/fulfillment/claims               → Create new claim (admin override)
GET    /admin/fulfillment/claims/:id           → Get single claim details
PATCH  /admin/fulfillment/claims/:id           → Update claim status (fulfill/reject)
GET    /admin/fulfillment/reward-types         → List available reward types
POST   /admin/fulfillment/reward-types         → Create new reward type
PATCH  /admin/fulfillment/reward-types/:id     → Update reward type
GET    /admin/fulfillment/streamer-stats       → Per-streamer metrics & breakdown
GET    /admin/audit-logs?action=REWARD_*       → Audit trail for fulfillment actions
```

**Key Implementation Details:**
- All endpoints require admin middleware (ADMIN_EMAILS check)
- All mutations logged to `auditLog` table with action prefix `REWARD_CLAIM_*`
- Response includes pagination info (offset, limit, total)
- Supports filters: `?status=pending&userId=xxx&rewardTypeId=xxx`

### 3.3 Audit Logging

**Pattern:** Use existing `auditLog` table with structured `action` and `details` fields.

```typescript
// Example audit log entries:
{
  adminId: "founder-id",
  action: "REWARD_CLAIM_CREATED",
  targetId: "player-id",
  details: { rewardTypeId: "...", pointsSpent: 500 },
  timestamp: now()
}

{
  adminId: "founder-id",
  action: "REWARD_CLAIM_FULFILLED",
  targetId: "player-id",
  details: { 
    claimId: "...",
    fulfillmentMethod: "email",
    code: "XXXX-XXXX",
    notes: "Sent via email to player@example.com"
  },
  timestamp: now()
}

{
  adminId: "founder-id",
  action: "REWARD_CLAIM_REJECTED",
  targetId: "player-id",
  details: { 
    claimId: "...",
    reason: "Duplicate claim detected"
  },
  timestamp: now()
}
```

---

## 4. Frontend Architecture

### 4.1 Mission Control Dashboard Structure

**Location:** `client/src/pages/admin/MissionControlDashboard.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Founder Mission Control | GG LOOP                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─ HIGH-LEVEL METRICS ──────────────────────────┐  │
│  │ • Total Claims This Week: 42                  │  │
│  │ • Pending (Needs Action): 8                   │  │
│  │ • USD Spent This Week: $2,341                 │  │
│  │ • Fulfillment Rate: 95%                       │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ TOP REWARD TYPES ────────────────────────────┐  │
│  │ Amazon $25: 18 claims | Steam $20: 12 claims │  │
│  │ Cash App: 7 claims | DoorDash: 5 claims      │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ STREAMER LEADERBOARD ────────────────────────┐  │
│  │ 1. Streamer Alpha: 15 claims, 12 fulfilled   │  │
│  │ 2. Streamer Beta: 12 claims, 11 fulfilled    │  │
│  │ 3. Streamer Gamma: 8 claims, 8 fulfilled     │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  [TAB: CLAIMS QUEUE] [TAB: USER DETAIL] [TAB: LOGS] │
│                                                       │
│  (Tab content below)                                │
└─────────────────────────────────────────────────────┘
```

### 4.2 Tab 1: Claims Queue (Ops View)

**Component:** `admin/fulfillment/ClaimsQueue.tsx`

```
┌─────────────────────────────────────────────────────┐
│  FULFILLMENT QUEUE (Pending Claims)                 │
├─────────────────────────────────────────────────────┤
│  Status Filter: [All] [Pending] [In Progress]       │
│  Sort: [By Date ↓] [By USD Value ↓]                │
├─────────────────────────────────────────────────────┤
│ # │ Player     │ Reward       │ USD    │ Age  │ Actions
├─────────────────────────────────────────────────────┤
│ 1 │ Player1    │ Amazon $25   │ $25.00 │ 2h   │ [Fulfill] [Reject]
│ 2 │ Player2    │ Steam $20    │ $20.00 │ 4h   │ [Fulfill] [Reject]
│ 3 │ Player3    │ Cash App $50 │ $50.00 │ 12h  │ [Fulfill] [Reject]
│   │            │              │        │      │
│   │ [PAGINATION: 1-3 of 8]                         │
└─────────────────────────────────────────────────────┘

When [Fulfill] is clicked → Modal appears:

┌─ Fulfill Reward ─────────────────────┐
│ Player: Player1                      │
│ Reward: Amazon Gift Card $25         │
│ Claimed: Jan 20, 2025 2:30 PM        │
│                                      │
│ Fulfillment Method:                  │
│ ○ Email Code                         │
│ ○ Manual Note                        │
│ ○ Shipped (with tracking)            │
│                                      │
│ Code/Details:                        │
│ [___________________________]         │
│                                      │
│ Internal Notes:                      │
│ [________________________]            │
│                                      │
│         [Cancel] [Confirm Fulfill]   │
└──────────────────────────────────────┘
```

### 4.3 Tab 2: User Detail View

**Component:** `admin/fulfillment/UserDetailView.tsx`

Shows full claim history + metrics for a specific user (search by name/email).

```
┌─────────────────────────────────────────────────────┐
│ Search: [_____________________] [Search]            │
│ Results for: StreamerAlpha (user123)                │
├─────────────────────────────────────────────────────┤
│ Profile: StreamerAlpha (Twitch: twitch.tv/alpha)   │
│ Total Claims: 15 | Fulfilled: 14 | Pending: 1      │
│ Total USD Value: $312.50                           │
├─────────────────────────────────────────────────────┤
│ CLAIM HISTORY:                                      │
│ 1. Amazon $25 - FULFILLED (Jan 20, Code sent)      │
│ 2. Steam $20 - FULFILLED (Jan 19, Code sent)       │
│ 3. Cash App $50 - PENDING (Jan 18, Waiting)        │
│ ... (paginated)                                     │
└─────────────────────────────────────────────────────┘
```

### 4.4 Tab 3: Audit Logs

**Component:** `admin/fulfillment/AuditLogsView.tsx`

Filtered view of `auditLog` table with `action LIKE 'REWARD_*'`.

```
┌─────────────────────────────────────────────────────┐
│ Filter by Action:                                   │
│ [All] [CREATED] [FULFILLED] [REJECTED]             │
│                                                     │
│ Timestamp        │ Admin    │ Action      │ Target  │
├─────────────────────────────────────────────────────┤
│ Jan 20 2:45 PM   │ Founder  │ CREATED     │ Player1 │
│ Jan 20 2:30 PM   │ Founder  │ FULFILLED   │ Player2 │
│ Jan 20 1:50 PM   │ Founder  │ REJECTED    │ Player3 │
│ ... (paginated)                                     │
└─────────────────────────────────────────────────────┘
```

### 4.5 Reward Types Configuration Panel

**Component:** `admin/fulfillment/RewardTypesConfig.tsx`

Allows founder to add/edit reward types available for claiming.

```
┌─────────────────────────────────────────────────────┐
│ REWARD TYPES                                        │
├─────────────────────────────────────────────────────┤
│ [+ ADD NEW REWARD TYPE]                            │
├─────────────────────────────────────────────────────┤
│ Active Rewards:                                     │
│ • Amazon Gift Card $25 (500 pts) - Digital         │
│ • Steam Gift Card $20 (400 pts) - Digital          │
│ • DoorDash $30 (600 pts) - Delivery                │
│ • Cash App $50 (1000 pts) - Cash                   │
│ • PayPal $50 (1000 pts) - Cash                     │
│ • Riot Points 1380 (300 pts) - Digital             │
│                                                     │
│ [EDIT] [DEACTIVATE]  (for each)                    │
└─────────────────────────────────────────────────────┘
```

---

## 5. Implementation Phases

### Phase 1: Database Schema ✓ (Design review)
- Add `rewardTypes`, `rewardClaims`, `fulfillmentMetrics` tables
- Add Zod schemas for validation
- Create migration file

### Phase 2: Backend Services
- Create `fulfillmentService.ts` with core business logic
- Add routes to `admin.ts` for claims CRUD + metrics
- Implement audit logging
- Add error handling & input validation

### Phase 3: Frontend Components
- Build Mission Control dashboard skeleton
- Implement metrics fetching & display
- Build Claims Queue tab with actions
- Build User Detail tab
- Build Audit Logs tab

### Phase 4: Integration & Testing
- Connect frontend to backend routes
- Test full fulfillment workflow
- Validate build & TypeScript errors
- Deploy to Railway

### Phase 5: Documentation & Training
- Write admin guide for founder
- Document reward type configuration
- Create troubleshooting guide

---

## 6. Extensibility Roadmap

**Phase 2 Features (Post-V1):**
- Integration with Tremendous API for gift card delivery
- Stripe Connect for cash payouts
- Scheduled claim auto-expiration (e.g., 30 days)
- Bulk import of reward codes
- Email notifications to players on fulfillment

**Phase 3 Features:**
- Multi-founder support (role-based access)
- Budget caps & thresholds
- Fraud detection rules
- Seasonal reward type templates
- Analytics export (CSV)

---

## 7. Success Criteria

**V1 Complete When:**
- ✅ All 6 reward types configured and claimable
- ✅ Founder can see pending claims queue
- ✅ Founder can manually fulfill/reject claims with notes
- ✅ Audit trail captures all fulfillment actions
- ✅ Mission Control dashboard shows key metrics
- ✅ Build passes (0 TypeScript errors)
- ✅ Deployed to Railway and live
- ✅ No breaking changes to existing user flows

---

## 8. Implementation Notes

### Conventions to Follow
- **ORM:** Drizzle PostgreSQL (pgTable, sql, indexes)
- **Validation:** Zod schemas (createInsertSchema pattern)
- **Auth:** ADMIN_EMAILS middleware (no new auth tables needed)
- **Timestamps:** Use `defaultNow()` for automatic defaults
- **IDs:** UUIDs via `gen_random_uuid()`
- **Routes:** RESTful, prefixed with `/admin/fulfillment/`
- **Audit:** Always use `auditLog` table with structured action names
- **Errors:** Use existing error handling patterns in `server/routes.ts`

### Build Validation
```bash
npm run build  # Must succeed with 0 TypeScript errors
npm run verify:dist  # Must pass verification
```

### Deployment
- Commit to `main` branch → Railway auto-deploys
- No manual deployment steps
- All database migrations must be Drizzle-compatible

---

## Questions for Review

1. **Streamer Metrics:** Should we track which streamer each player is associated with (via referralCode)?
   - Current: Yes, via `users.referredBy` field. Will use for streamer breakdown.

2. **Fraud Detection V1:** Manual review only, or do we need automated checks?
   - Current: Manual review only. Auditor flags suspicious patterns.

3. **Point Deduction:** When a claim is fulfilled, should we deduct points from the user?
   - Current: Points already spent at claim time (user can't claim if insufficient).
   - Action: Verify with existing `pointTransactions` pattern.

4. **Notification to Players:** Should we auto-email players when claim is fulfilled?
   - Current: Manual notes only (founder handles messaging).
   - Future: Add email templates in Phase 2.

---

**Next Step:** User reviews design and confirms approval to proceed with Phase 1-2 implementation.
