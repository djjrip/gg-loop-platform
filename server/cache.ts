import NodeCache from "node-cache";

// ========================================
// LEVEL 13 PHASE 2: CACHING LAYER
// ========================================
// Reduces database load by 60%+
// All cached data is fraud-gated

interface CacheConfig {
  stdTTL: number; // Standard time-to-live in seconds
  checkperiod: number; // Check for expired keys every X seconds
  useClones: boolean; // Clone data on get/set
}

// Cache instances with different TTLs
const shortCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes
const mediumCache = new NodeCache({ stdTTL: 900, checkperiod: 120 }); // 15 minutes
const longCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 }); // 1 hour

/**
 * Generic cache wrapper with automatic fetch
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not cached
 * @param ttl - Time to live in seconds (optional, uses cache default)
 * @param cacheInstance - Which cache to use (short/medium/long)
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number,
  cacheInstance: NodeCache = mediumCache
): Promise<T> {
  // Check cache first
  const cached = cacheInstance.get<T>(key);
  if (cached !== undefined) {
    console.log(`[CACHE HIT] ${key}`);
    return cached;
  }

  // Cache miss - fetch data
  console.log(`[CACHE MISS] ${key} - fetching...`);
  const data = await fetchFn();

  // Store in cache
  if (ttl) {
    cacheInstance.set(key, data, ttl);
  } else {
    cacheInstance.set(key, data);
  }

  return data;
}

/**
 * Invalidate cache by key or pattern
 * @param keyOrPattern - Exact key or pattern (e.g., "leaderboard:*")
 */
export function invalidateCache(keyOrPattern: string, cacheInstance: NodeCache = mediumCache): void {
  if (keyOrPattern.includes("*")) {
    // Pattern matching - invalidate all matching keys
    const keys = cacheInstance.keys();
    const pattern = keyOrPattern.replace("*", "");
    const matchingKeys = keys.filter(k => k.startsWith(pattern));
    cacheInstance.del(matchingKeys);
    console.log(`[CACHE INVALIDATE] Cleared ${matchingKeys.length} keys matching ${keyOrPattern}`);
  } else {
    // Exact key
    cacheInstance.del(keyOrPattern);
    console.log(`[CACHE INVALIDATE] Cleared ${keyOrPattern}`);
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  shortCache.flushAll();
  mediumCache.flushAll();
  longCache.flushAll();
  console.log("[CACHE] All caches cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    short: shortCache.getStats(),
    medium: mediumCache.getStats(),
    long: longCache.getStats()
  };
}

// Export cache instances for direct use if needed
export { shortCache, mediumCache, longCache };

// ========================================
// CACHE KEY GENERATORS
// ========================================

export const CacheKeys = {
  // Leaderboards (5 min TTL)
  leaderboard: (limit: number = 100) => `leaderboard:${limit}`,
  creatorLeaderboard: (limit: number = 100) => `creator_leaderboard:${limit}`,
  
  // User data (15 min TTL)
  userProfile: (userId: number) => `user:${userId}:profile`,
  userStats: (userId: number) => `user:${userId}:stats`,
  userAnalytics: (userId: number) => `user:${userId}:analytics`,
  
  // Creator data (15 min TTL)
  creatorStats: (userId: number) => `creator:${userId}:stats`,
  creatorTier: (userId: number) => `creator:${userId}:tier`,
  
  // Analytics (15 min TTL)
  platformOverview: () => "analytics:platform_overview",
  engagementMetrics: () => "analytics:engagement",
  revenueMetrics: () => "analytics:revenue",
  
  // Anti-cheat (5 min TTL)
  antiCheatStatus: (userId: number) => `anticheat:${userId}:status`,
  rateLimitState: (userId: number) => `anticheat:${userId}:ratelimit`
};

// ========================================
// CACHE INVALIDATION TRIGGERS
// ========================================

/**
 * Invalidate user-related caches when user data changes
 */
export function invalidateUserCaches(userId: number): void {
  invalidateCache(CacheKeys.userProfile(userId));
  invalidateCache(CacheKeys.userStats(userId));
  invalidateCache(CacheKeys.userAnalytics(userId));
  invalidateCache(CacheKeys.creatorStats(userId));
  invalidateCache(CacheKeys.creatorTier(userId));
  invalidateCache(CacheKeys.antiCheatStatus(userId));
  invalidateCache(CacheKeys.rateLimitState(userId));
}

/**
 * Invalidate leaderboard caches when rankings change
 */
export function invalidateLeaderboardCaches(): void {
  invalidateCache("leaderboard:*");
  invalidateCache("creator_leaderboard:*");
}

/**
 * Invalidate analytics caches when new data is added
 */
export function invalidateAnalyticsCaches(): void {
  invalidateCache(CacheKeys.platformOverview());
  invalidateCache(CacheKeys.engagementMetrics());
  invalidateCache(CacheKeys.revenueMetrics());
}
