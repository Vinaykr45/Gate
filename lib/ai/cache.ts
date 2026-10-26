/**
 * lib/ai/cache.ts
 *
 * In-memory LRU-style cache with TTL and pending request deduplication.
 * Ensures identical prompt requests are not sent twice concurrently.
 */

import { AI_CONFIG } from './config.ts'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class AICacheManager {
  private cache = new Map<string, CacheEntry<unknown>>()
  private inFlight = new Map<string, Promise<unknown>>()
  private maxEntries = 200

  private hashKey(key: string): string {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0 // Convert to 32bit integer
    }
    return `aicache_${hash}_${key.slice(0, 32)}`
  }

  get<T>(key: string): T | null {
    if (!AI_CONFIG.cacheEnabled) return null
    const hashed = this.hashKey(key)
    const entry = this.cache.get(hashed)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hashed)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttlSeconds = 3600): void {
    if (!AI_CONFIG.cacheEnabled) return
    const hashed = this.hashKey(key)

    // Enforce size limit
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(hashed, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Deduplicates identical concurrent requests to prevent duplicate LLM calls
   */
  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const hashed = this.hashKey(key)
    const existing = this.inFlight.get(hashed)
    if (existing) {
      return existing as Promise<T>
    }

    const promise = fetcher().finally(() => {
      this.inFlight.delete(hashed)
    })

    this.inFlight.set(hashed, promise)
    return promise
  }

  clear(): void {
    this.cache.clear()
    this.inFlight.clear()
  }
}

export const aiCache = new AICacheManager()
