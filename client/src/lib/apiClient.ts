/**
 * Enhanced API Client with Retry Logic and Error Handling
 */

interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Sleep utility for retries
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Enhanced fetch with retry logic and better error handling
 */
export async function apiRequestWithRetry(
  method: string,
  endpoint: string,
  body?: any,
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  
  let lastError: Error | null = null;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': generateRequestId(),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Don't retry on client errors (4xx) except for specific cases
      if (response.status >= 400 && response.status < 500) {
        if (response.status === 429 || response.status === 408) {
          // Retry on rate limit and timeout
          if (attempt < config.maxAttempts) {
            await sleep(delay);
            delay *= config.backoffMultiplier;
            continue;
          }
        } else {
          // Don't retry other 4xx errors
          const data = await response.json().catch(() => ({}));
          throw new APIError(
            response.status,
            response.statusText,
            data.message || `HTTP ${response.status}: ${response.statusText}`,
            data
          );
        }
      }

      // Retry on server errors and specified statuses
      if (config.retryableStatuses.includes(response.status)) {
        if (attempt < config.maxAttempts) {
          console.warn(
            `API request failed with ${response.status}, retrying (attempt ${attempt}/${config.maxAttempts})...`
          );
          await sleep(delay);
          delay *= config.backoffMultiplier;
          continue;
        }
      }

      if (!response.ok && response.status >= 500) {
        const data = await response.json().catch(() => ({}));
        throw new APIError(
          response.status,
          response.statusText,
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          data
        );
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Network errors and timeouts can be retried
      if (error instanceof TypeError && attempt < config.maxAttempts) {
        console.warn(
          `Network error, retrying (attempt ${attempt}/${config.maxAttempts})...`,
          error.message
        );
        await sleep(delay);
        delay *= config.backoffMultiplier;
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Unknown error after all retry attempts');
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await sleep(waitTime);
      return this.acquire();
    }

    this.requests.push(now);
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * Circuit breaker for failing endpoints
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(failureThreshold: number = 5, resetTimeoutMs: number = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}
