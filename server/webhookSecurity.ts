import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { IStorage } from './storage';

/**
 * HMAC-SHA256 webhook signature validation for gaming partner webhooks
 * 
 * Security features:
 * - Timing-safe signature comparison (prevents timing attacks)
 * - Timestamp validation (prevents replay attacks)
 * - Raw body validation (prevents tampering)
 * 
 * Partner signature generation example:
 * ```
 * const timestamp = Math.floor(Date.now() / 1000);
 * const payload = JSON.stringify(requestBody);
 * const signedContent = `${timestamp}.${payload}`;
 * const signature = crypto.createHmac('sha256', apiSecret)
 *   .update(signedContent)
 *   .digest('hex');
 * 
 * headers: {
 *   'X-Webhook-Signature': signature,
 *   'X-Webhook-Timestamp': timestamp
 * }
 * ```
 */

export interface WebhookValidationResult {
  valid: boolean;
  partnerId?: string;
  error?: string;
  statusCode?: number;
}

export async function validateWebhookSignature(
  req: Request,
  storage: IStorage
): Promise<WebhookValidationResult> {
  try {
    // Extract signature and timestamp from headers
    const signature = req.get('X-Webhook-Signature');
    const timestampHeader = req.get('X-Webhook-Timestamp');

    if (!signature) {
      return {
        valid: false,
        error: 'Missing X-Webhook-Signature header',
        statusCode: 401
      };
    }

    if (!timestampHeader) {
      return {
        valid: false,
        error: 'Missing X-Webhook-Timestamp header',
        statusCode: 401
      };
    }

    // Validate timestamp format
    const timestamp = parseInt(timestampHeader, 10);
    if (isNaN(timestamp) || timestamp <= 0) {
      return {
        valid: false,
        error: 'Invalid timestamp format',
        statusCode: 401
      };
    }

    // Validate timestamp is recent (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - timestamp);
    const TOLERANCE_SECONDS = 300; // 5 minutes

    if (timeDiff > TOLERANCE_SECONDS) {
      return {
        valid: false,
        error: 'Request timestamp expired (must be within 5 minutes)',
        statusCode: 401
      };
    }

    // Extract API key from request body
    const apiKey = req.body?.apiKey;
    if (!apiKey) {
      return {
        valid: false,
        error: 'Missing apiKey in request body',
        statusCode: 400
      };
    }

    // Fetch partner
    const partner = await storage.getApiPartner(apiKey);
    if (!partner || !partner.isActive) {
      return {
        valid: false,
        error: 'Invalid API key or inactive partner',
        statusCode: 401
      };
    }

    // Get raw request body (must be captured by express.json verify callback)
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      return {
        valid: false,
        error: 'Raw body not available - check Express middleware configuration',
        statusCode: 500
      };
    }

    // Compute expected signature
    // Format: HMAC-SHA256(secret, "timestamp.rawBody")
    const signedContent = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', partner.apiSecret)
      .update(signedContent)
      .digest('hex');

    // Timing-safe comparison (prevents timing attacks)
    const receivedSigBuffer = Buffer.from(signature, 'utf8');
    const expectedSigBuffer = Buffer.from(expectedSignature, 'utf8');

    // Check lengths first (fast check before timing-safe comparison)
    if (receivedSigBuffer.length !== expectedSigBuffer.length) {
      return {
        valid: false,
        error: 'Invalid signature',
        statusCode: 401
      };
    }

    // Constant-time comparison
    const signaturesMatch = crypto.timingSafeEqual(
      receivedSigBuffer,
      expectedSigBuffer
    );

    if (!signaturesMatch) {
      return {
        valid: false,
        error: 'Invalid signature',
        statusCode: 401
      };
    }

    // Success!
    return {
      valid: true,
      partnerId: partner.id
    };

  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return {
      valid: false,
      error: 'Signature validation failed',
      statusCode: 500
    };
  }
}

/**
 * Express middleware for webhook signature validation
 */
export function createWebhookSignatureMiddleware(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await validateWebhookSignature(req, storage);
    
    if (!result.valid) {
      return res.status(result.statusCode || 401).json({
        message: result.error || 'Signature validation failed'
      });
    }

    // Attach partner ID to request for downstream use
    if (result.partnerId !== undefined) {
      (req as any).partnerId = result.partnerId;
    }
    next();
  };
}
