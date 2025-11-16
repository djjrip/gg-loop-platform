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

class TangoCardService {
  private platformName: string;
  private platformKey: string;
  private apiUrl: string;
  private authHeader: string;

  constructor() {
    this.platformName = process.env.TANGO_CARD_PLATFORM_NAME || '';
    this.platformKey = process.env.TANGO_CARD_PLATFORM_KEY || '';
    this.apiUrl = process.env.TANGO_CARD_API_URL || 'https://integration-api.tangocard.com/raas/v2';
    
    if (!this.platformName || !this.platformKey) {
      console.warn('[TangoCard] Missing credentials. Service will not work.');
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${this.platformName}:${this.platformKey}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  // Fetch catalog (memoized for 12 hours as per Tango's recommendation)
  private fetchCatalogInternal = memoize(
    async (): Promise<TangoCatalogResponse> => {
      try {
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
    const catalog = await this.getCatalog();
    return catalog.find(item => item.utid === utid) || null;
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.fetchCatalogInternal.clear();
  }
}

export const tangoCardService = new TangoCardService();
