import fetch from 'node-fetch';
import memoize from 'memoizee';

interface TangoCardItem {
  utid: string;
  rewardName: string;
  currencyCode: string;
  status: string;
  valueType: string;
  rewardType: string;
  isExpirable: boolean;
  faceValue: number;
  minValue?: number;
  maxValue?: number;
  countries: string[];
  credentialTypes: string[];
  redemptionInstructions: string;
  description?: string;
  items?: Array<{
    utid: string;
    rewardName: string;
    faceValue: number;
    currencyCode: string;
  }>;
}

interface TangoCatalogResponse {
  brands: TangoCardItem[];
}

// NOTE: Tango Card application for our account was rejected. This file remains in the
// codebase for reference and possible future integration, but the service is disabled
// by default via the environment variable `ENABLE_TANGO_INTEGRATION=false`.
//
// To enable Tango Card integration (if approved), set `ENABLE_TANGO_INTEGRATION=true` and
// provide the required credentials. Otherwise the service will no-op and log a warning.
class TangoCardService {
  private platformName: string;
  private platformKey: string;
  private apiUrl: string;
  private authHeader: string = '';
  private enabled: boolean;

  constructor() {
    this.platformName = process.env.TANGO_CARD_PLATFORM_NAME || '';
    this.platformKey = process.env.TANGO_CARD_PLATFORM_KEY || '';
    this.apiUrl = process.env.TANGO_CARD_API_URL || 'https://integration-api.tangocard.com/raas/v2';
    this.enabled = process.env.ENABLE_TANGO_INTEGRATION === 'true';
    if (!this.enabled) {
      console.warn('[TangoCard] Integration disabled via ENABLE_TANGO_INTEGRATION. This service will not perform live calls.');
      return;
    }

    if (!this.platformName || !this.platformKey) {
      console.warn('[TangoCard] Missing credentials. Service will not work even if enabled.');
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${this.platformName}:${this.platformKey}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  // Fetch catalog (memoized for 12 hours as per Tango's recommendation)
  private fetchCatalogInternal = memoize(
    async (): Promise<TangoCatalogResponse> => {
      try {
        if (!this.enabled) {
          console.warn('[TangoCard] Disabled - fetchCatalogInternal returning empty list');
          return { brands: [] } as TangoCatalogResponse;
        }
        console.log('[TangoCard] Fetching catalog...');
        const response = await fetch(`${this.apiUrl}/catalogs`, {
          method: 'GET',
          headers: {
            'Authorization': this.authHeader,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[TangoCard] API Error:', response.status, errorText);
          throw new Error(`Tango Card API error: ${response.status}`);
        }

        const data = await response.json() as TangoCatalogResponse;
        console.log(`[TangoCard] Fetched ${data.brands?.length || 0} catalog items`);
        return data;
      } catch (error) {
        console.error('[TangoCard] Failed to fetch catalog:', error);
        throw error;
      }
    },
    {
      maxAge: 12 * 60 * 60 * 1000, // Cache for 12 hours
      promise: true,
    }
  );

  async getCatalog(): Promise<TangoCardItem[]> {
    try {
      const response = await this.fetchCatalogInternal();
      
      // Filter for active, US-available items
      return (response.brands || []).filter(item => 
        item.status === 'active' && 
        item.countries.includes('US')
      );
    } catch (error) {
      console.error('[TangoCard] Error getting catalog:', error);
      return [];
    }
  }

  async placeOrder(utid: string, amount: number, recipientEmail: string): Promise<any> {
    try {
      if (!this.enabled) {
        console.warn('[TangoCard] Place order requested but Tango integration is disabled');
        throw new Error('Tango integration disabled');
      }
      console.log(`[TangoCard] Placing order for UTID: ${utid}, amount: ${amount}`);
      
      const orderPayload = {
        accountIdentifier: this.platformName,
        amount: amount,
        customerIdentifier: recipientEmail,
        sendEmail: true,
        recipient: {
          email: recipientEmail,
        },
        utid: utid,
        externalRefID: `ggloop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TangoCard] Order API Error:', response.status, errorText);
        throw new Error(`Failed to place order: ${response.status}`);
      }

      const orderData = await response.json() as any;
      console.log('[TangoCard] Order placed successfully:', orderData.referenceOrderID);
      return orderData;
    } catch (error) {
      console.error('[TangoCard] Failed to place order:', error);
      throw error;
    }
  }

  // Helper to get item details
  async getItemByUtid(utid: string): Promise<TangoCardItem | null> {
    if (!this.enabled) return null;
    const catalog = await this.getCatalog();
    return catalog.find(item => item.utid === utid) || null;
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.fetchCatalogInternal.clear();
  }
}

export const tangoCardService = new TangoCardService();
