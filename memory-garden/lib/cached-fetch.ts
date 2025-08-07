// Enhanced fetch with HTTP caching support
export interface CachedFetchOptions extends RequestInit {
  ttl?: number // Time to live in seconds
  bypassCache?: boolean // Skip cache entirely
}

export async function cachedFetch(
  url: string, 
  options: CachedFetchOptions = {}
): Promise<Response> {
  const { ttl = 60, bypassCache = false, ...fetchOptions } = options
  
  // Add cache-control headers to request
  const headers = new Headers(fetchOptions.headers)
  
  if (bypassCache) {
    // Force fresh data
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
  } else {
    // Allow cached data up to ttl seconds
    headers.set('Cache-Control', `max-age=${ttl}`)
  }
  
  // Add headers to indicate we support conditional requests
  headers.set('Accept', 'application/json, */*')
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  })
  
  return response
}

// Utility to create fetch functions with consistent caching
export function createCachedFetcher(baseUrl: string, defaultTtl: number = 60) {
  return async function <T = any>(
    path: string, 
    options: CachedFetchOptions = {}
  ): Promise<T> {
    const url = `${baseUrl}${path}`
    const response = await cachedFetch(url, { ttl: defaultTtl, ...options })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
}