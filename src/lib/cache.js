// High-performance In-Memory SWR Client Cache for SIAGA

const memoryCache = new Map()

/**
 * Get item from memory cache if not expired
 */
export function getCached(key) {
  const item = memoryCache.get(key)
  if (!item) return null
  if (Date.now() > item.expiry) {
    memoryCache.delete(key)
    return null
  }
  return item.data
}

/**
 * Store item in memory cache with TTL (milliseconds)
 */
export function setCached(key, data, ttlMs = 20000) {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
    timestamp: Date.now(),
  })
}

/**
 * Invalidate a specific cache key or keys matching prefix
 */
export function invalidateCache(prefix) {
  if (!prefix) {
    memoryCache.clear()
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}

