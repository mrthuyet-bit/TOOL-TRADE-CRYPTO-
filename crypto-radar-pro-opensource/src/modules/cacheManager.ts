/**
 * CACHE & RATE LIMIT DEFENSE ENGINE
 * Bảo vệ ứng dụng khỏi Rate-limit API (429), giảm thiểu tối đa chi phí và số lượt gọi.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  source: string;
}

export class MemoryCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private failureCounts = new Map<string, number>();
  private circuitBreakers = new Map<string, number>(); // timestamp when it reopens

  get<T>(key: string): { data: T | null; isStale: boolean; status: 'LIVE' | 'STALE' | 'NONE' } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { data: null, isStale: false, status: 'NONE' };
    }

    const now = Date.now();
    const isStale = now - entry.timestamp > entry.ttlMs;

    return {
      data: entry.data,
      isStale,
      status: isStale ? 'STALE' : 'LIVE',
    };
  }

  set<T>(key: string, data: T, ttlMs: number, source: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      source,
    });
    // Reset failure counter on success
    this.failureCounts.set(key, 0);
  }

  isCircuitOpen(endpointKey: string): boolean {
    const reopenTime = this.circuitBreakers.get(endpointKey);
    if (!reopenTime) return false;
    if (Date.now() > reopenTime) {
      this.circuitBreakers.delete(endpointKey);
      return false; // Re-open circuit
    }
    return true; // Still open (temporarily blocking requests)
  }

  recordFailure(endpointKey: string, cooldownMs: number = 30000): void {
    const current = (this.failureCounts.get(endpointKey) || 0) + 1;
    this.failureCounts.set(endpointKey, current);

    // If 3 consecutive failures, trip circuit breaker for cooldownMs
    if (current >= 3) {
      this.circuitBreakers.set(endpointKey, Date.now() + cooldownMs);
    }
  }

  clear(): void {
    this.cache.clear();
    this.failureCounts.clear();
    this.circuitBreakers.clear();
  }
}

export const globalCache = new MemoryCacheManager();
