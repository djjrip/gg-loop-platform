# Integration Scaffolding

This directory contains scaffolding for future third-party integrations.

## Available Integrations

### Tango Card (Planned)
**Purpose:** Gift card fulfillment  
**Status:** Scaffolded, needs implementation  
**Required Env Vars:**
- `TANGO_CARD_API_URL`
- `TANGO_CARD_PLATFORM_NAME`
- `TANGO_CARD_PLATFORM_KEY`

**Setup Steps:**
1. Sign up at https://www.tangocard.com/
2. Get API credentials
3. Add env vars to Replit secrets
4. Implement integration in `tango-card/index.ts`

### Tremendous (Recommended Alternative)
**Purpose:** Modern reward fulfillment API  
**Status:** Scaffolded, ready for implementation  
**Required Env Vars:**
- `TREMENDOUS_API_KEY`

**Setup Steps:**
1. Sign up at https://www.tremendous.com/
2. Get API key
3. Add to Replit secrets
4. Implement integration in `tremendous/index.ts`

**Why Tremendous?**
- Modern API design
- Better documentation
- Easier integration
- More reliable than Tango Card

### Printful (Planned)
**Purpose:** Physical merchandise fulfillment  
**Status:** Scaffolded, needs implementation  
**Required Env Vars:**
- `PRINTFUL_API_KEY`

**Setup Steps:**
1. Sign up at https://www.printful.com/
2. Create store and get API key
3. Add to Replit secrets
4. Implement integration in `printful/index.ts`

## Implementation Pattern

Each integration should follow this structure:

```typescript
// integrations/{service}/index.ts
export class {Service}Integration {
  constructor(private config: {Service}Config) {}
  
  async getCatalog(): Promise<Item[]> { ... }
  async fulfillOrder(orderId: string): Promise<FulfillmentResult> { ... }
  async getOrderStatus(orderId: string): Promise<OrderStatus> { ... }
}

export default {Service}Integration;
```

## Next Steps

1. **Phase 3** (Current): Using mock data in `client/src/pages/Shop.tsx`
2. **Phase 4**: Implement Tremendous integration (recommended)
3. **Phase 5**: Add Printful for physical merchandise
4. **Phase 6**: Consider Tango Card if needed
