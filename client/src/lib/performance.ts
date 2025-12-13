/**
 * Performance Optimization Utilities
 * Includes caching, memoization, and lazy loading strategies
 */

/**
 * Simple cache with TTL (Time To Live)
 */
export class CacheWithTTL<T> {
  private cache: Map<string, { value: T; expiresAt: number }> = new Map();

  constructor(private defaultTTLMs: number = 5 * 60 * 1000) {}

  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLMs);
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Request deduplication - prevent duplicate API calls
 */
export class RequestDeduplicator {
  private activeRequests: Map<string, Promise<any>> = new Map();

  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // If request is already in progress, return the existing promise
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key);
    }

    // Create new request promise
    const promise = fn()
      .then((result) => {
        this.activeRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.activeRequests.delete(key);
        throw error;
      });

    this.activeRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.activeRequests.clear();
  }
}

/**
 * Intersection Observer utility for lazy loading
 */
export function useLazyLoad(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const observer = new IntersectionObserver(callback, {
    threshold: 0.1,
    ...options,
  });

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle utility
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delayMs) {
      lastCallTime = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        fn(...args);
      }, delayMs - (now - lastCallTime));
    }
  };
}

/**
 * Memoize utility
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Image loading optimization with fallback
 */
export async function loadImageWithFallback(
  primaryUrl: string,
  fallbackUrl?: string,
  timeoutMs: number = 5000
): Promise<string> {
  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(
        () => reject(new Error('Image load timeout')),
        timeoutMs
      );

      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  };

  try {
    return await loadImage(primaryUrl);
  } catch (error) {
    if (fallbackUrl) {
      try {
        return await loadImage(fallbackUrl);
      } catch {
        return fallbackUrl; // Return fallback URL even if it fails
      }
    }
    throw error;
  }
}

/**
 * Connection speed detection
 */
export function getConnectionSpeed(): 'slow' | 'normal' | 'fast' {
  const connection = (navigator as any).connection;
  
  if (!connection) return 'normal';

  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'slow';
    case '3g':
      return 'normal';
    case '4g':
      return 'fast';
    default:
      return 'normal';
  }
}

/**
 * Progressive image loading
 */
export const progressiveImageSettings = {
  slow: { quality: 0.5, width: 400 },
  normal: { quality: 0.75, width: 800 },
  fast: { quality: 1, width: 1600 },
};

/**
 * Global instances
 */
export const cacheManager = new CacheWithTTL(5 * 60 * 1000); // 5 minute default TTL
export const requestDeduplicator = new RequestDeduplicator();
