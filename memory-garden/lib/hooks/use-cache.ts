import { useState, useEffect, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  etag?: string
}

interface UseCacheOptions {
  ttl?: number // Time to live in milliseconds (default: 1 minute)
  staleWhileRevalidate?: number // Stale time in milliseconds (default: 5 minutes)
  persistToLocalStorage?: boolean // Persist cache across page reloads
}

const cache = new Map<string, CacheEntry<any>>()

// Load cache from localStorage on initialization
function loadCacheFromStorage() {
  if (typeof window === 'undefined') return
  
  try {
    const savedCache = localStorage.getItem('memory-garden-cache')
    if (savedCache) {
      const parsedCache = JSON.parse(savedCache)
      Object.entries(parsedCache).forEach(([key, entry]) => {
        cache.set(key, entry as CacheEntry<any>)
      })
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error)
  }
}

// Save cache to localStorage
function saveCacheToStorage() {
  if (typeof window === 'undefined') return
  
  try {
    const cacheObj = Object.fromEntries(cache.entries())
    localStorage.setItem('memory-garden-cache', JSON.stringify(cacheObj))
  } catch (error) {
    console.warn('Failed to save cache to localStorage:', error)
  }
}

// Initialize cache from storage
if (typeof window !== 'undefined') {
  loadCacheFromStorage()
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const { ttl = 60000, staleWhileRevalidate = 300000, persistToLocalStorage = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now()
      const cacheEntry = cache.get(key)

      // If we have cached data and it's still fresh (not expired)
      if (!forceRefresh && cacheEntry && now < cacheEntry.expiresAt) {
        setData(cacheEntry.data)
        setIsLoading(false)
        return cacheEntry.data
      }

      // If we have stale data, return it immediately but fetch fresh data in background
      if (!forceRefresh && cacheEntry && now < cacheEntry.timestamp + staleWhileRevalidate) {
        setData(cacheEntry.data)
        setIsLoading(false)
        
        // Fetch fresh data in background
        fetcher().then(freshData => {
          const newEntry: CacheEntry<T> = {
            data: freshData,
            timestamp: now,
            expiresAt: now + ttl
          }
          cache.set(key, newEntry)
          setData(freshData)
          if (persistToLocalStorage) {
            saveCacheToStorage()
          }
        }).catch(err => {
          console.error('Background refresh failed:', err)
        })
        
        return cacheEntry.data
      }

      // No cache or expired cache - fetch fresh data
      setIsLoading(true)
      setError(null)
      
      const freshData = await fetcher()
      
      const newEntry: CacheEntry<T> = {
        data: freshData,
        timestamp: now,
        expiresAt: now + ttl
      }
      cache.set(key, newEntry)
      
      if (persistToLocalStorage) {
        saveCacheToStorage()
      }
      
      setData(freshData)
      setIsLoading(false)
      return freshData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [key, fetcher, ttl, staleWhileRevalidate, persistToLocalStorage])

  const invalidate = useCallback(() => {
    cache.delete(key)
    if (persistToLocalStorage) {
      saveCacheToStorage()
    }
  }, [key, persistToLocalStorage])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate
  }
}

// Utility function to invalidate cache by pattern
export function invalidateCache(pattern: string | RegExp) {
  const keys = Array.from(cache.keys())
  keys.forEach(key => {
    if (typeof pattern === 'string' && key.includes(pattern)) {
      cache.delete(key)
    } else if (pattern instanceof RegExp && pattern.test(key)) {
      cache.delete(key)
    }
  })
  saveCacheToStorage()
}

// Utility function to clear all cache
export function clearAllCache() {
  cache.clear()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('memory-garden-cache')
  }
}