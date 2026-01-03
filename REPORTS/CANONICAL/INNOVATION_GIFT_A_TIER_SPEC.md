# INNOVATION SPEC: Gift a Tier

**Status:** DESIGN ONLY — NO IMPLEMENTATION  
**Created:** 2026-01-03T21:06:08Z  
**Owner:** AG (Antigravity) — Innovation Track

---

## Feature Overview

Allow users to purchase a subscription tier as a gift for someone else.

### User Flow

```
1. Purchaser visits /gift-tier
2. Selects tier (Basic, Builder, Pro, Elite, or Founding Member)
3. Enters recipient email
4. Completes Stripe checkout
5. Recipient receives email with gift claim link
6. Recipient creates account or logs in
7. Tier is applied to recipient's account
```

---

## Key Requirements

### Stripe Integration

| Requirement | Details |
|-------------|---------|
| Payment processor | Stripe only |
| Checkout mode | One-time payment |
| Metadata | tier, recipient_email, purchaser_id |
| Webhook | checkout.session.completed |

### Gift Claim

| Requirement | Details |
|-------------|---------|
| Claim link | Unique, single-use token |
| Expiration | 30 days from purchase |
| Account requirement | Must create/login to claim |
| Transfer | Non-transferable after claim |

### Fraud Prevention

| Risk | Mitigation |
|------|------------|
| Self-gifting for discount | Same price, no discount |
| Claiming multiple times | Single-use claim token |
| Fake emails | Send to email, require verification |
| Resale | Non-transferable, tied to email |

---

## Database Schema (Conceptual)

```sql
CREATE TABLE gift_purchases (
  id SERIAL PRIMARY KEY,
  purchaser_id INTEGER REFERENCES users(id),
  recipient_email VARCHAR NOT NULL,
  tier VARCHAR NOT NULL,
  stripe_session_id VARCHAR NOT NULL,
  claim_token VARCHAR UNIQUE NOT NULL,
  claimed_at TIMESTAMP,
  claimed_by_user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI Mockup (Conceptual)

### Gift Purchase Page

```
┌─────────────────────────────────────┐
│ 🎁 Gift a GG LOOP Subscription      │
├─────────────────────────────────────┤
│ Select Tier:                        │
│ ○ Starter ($5/mo)                   │
│ ○ Builder ($8/mo)                   │
│ ○ Pro ($12/mo)                      │
│ ○ Elite ($25/mo)                    │
│ ● Founding Member ($29 lifetime)    │
├─────────────────────────────────────┤
│ Recipient Email:                    │
│ [_________________________]         │
├─────────────────────────────────────┤
│ [ Gift with Stripe → ]              │
└─────────────────────────────────────┘
```

### Gift Claim Email

```
Subject: You received a GG LOOP gift! 🎮

Hey!

[Purchaser] sent you a GG LOOP [Tier] subscription!

Click below to claim your gift:
[Claim Your Gift →]

This link expires in 30 days.

— The GG LOOP Team
```

---

## Implementation Priority

| Phase | Scope |
|-------|-------|
| Now | Spec only (this document) |
| Post-Launch | Evaluate demand |
| If Validated | Cursor implements |

---

*Design spec only. No implementation until validated.*
