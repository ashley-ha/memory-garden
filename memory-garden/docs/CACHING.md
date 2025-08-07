# Memory Garden Caching Implementation

## Overview
This document describes the comprehensive caching strategy implemented for Memory Garden to optimize performance and reduce server load.

## Caching Layers

### 1. Client-Side Caching (`lib/hooks/use-cache.ts`)
- **In-memory cache**: Stores API responses in browser memory
- **LocalStorage persistence**: Survives page reloads and browser sessions
- **Stale-while-revalidate**: Shows cached data immediately while fetching fresh data in background
- **Automatic invalidation**: Smart cache invalidation when data is updated

#### Configuration:
```typescript
{
  ttl: 60000, // Fresh for 1 minute
  staleWhileRevalidate: 300000, // Serve stale up to 5 minutes
  persistToLocalStorage: true // Persist across page reloads
}
```

### 2. HTTP Caching (`lib/api-cache.ts`)
- **Cache-Control headers**: `public, max-age=60, stale-while-revalidate=300`
- **ETag generation**: MD5 hash of response data for conditional requests
- **Last-Modified headers**: Enable browser conditional requests
- **CORS support**: Proper headers for cross-origin requests

### 3. Server-Side Caching
- **Next.js built-in caching**: Leverages Next.js App Router caching
- **Response headers**: Optimized cache directives for CDN and browser caching
- **Cache invalidation**: Automatic cache busting when data changes

## Cache Keys and TTL

### Topics API (`/api/topics`)
- **Cache Key**: `topics-${search}-${showAll}`
- **TTL**: 2 minutes fresh, 10 minutes stale
- **Invalidation**: When new topics created or deleted

### Cards API (`/api/cards`)
- **Cache Key**: `cards-${topicId}`
- **TTL**: 1 minute fresh, 5 minutes stale  
- **Invalidation**: When cards created, deleted, or voted on

### User Study Deck
- **Cache Key**: `user-study-deck-${userId}-${topicId}`
- **TTL**: 30 seconds fresh, 2 minutes stale
- **Invalidation**: When cards added/removed from deck

## Cache Invalidation Strategy

### Automatic Invalidation
```typescript
// When creating new cards
invalidateCache('cards-')  // Invalidates all card caches
refreshCards()             // Triggers fresh fetch

// When creating new topics  
invalidateCache('topics-') // Invalidates all topic caches
refreshTopics()            // Triggers fresh fetch
```

### Manual Cache Management
```typescript
import { clearAllCache, invalidateCache } from '@/lib/hooks/use-cache'

// Clear all cache
clearAllCache()

// Invalidate specific patterns
invalidateCache('cards-topic-123')  // Specific topic
invalidateCache(/^topics-/)         // All topic searches
```

## Browser Network Behavior

### First Visit
1. No cache → Fetch from server (200)
2. Store in memory + localStorage
3. Return fresh data

### Page Refresh (within TTL)
1. Check localStorage cache
2. If fresh → Return immediately (no network request)
3. If stale → Return cached + background fetch

### Page Refresh (after TTL)
1. Check localStorage cache  
2. If expired → Fresh fetch (200)
3. Update cache with new data

### Data Updates
1. User creates/deletes content
2. Automatic cache invalidation
3. Fresh fetch for updated data
4. UI updates immediately

## Performance Benefits

### Before Caching
- Every page refresh: Multiple API calls
- Network requests: 3-5 per page load
- Load time: 500-1000ms for data

### After Caching  
- Page refresh with cache: 0 API calls
- Network requests: 0 (from cache)
- Load time: <50ms for cached data

### Stale-While-Revalidate Benefits
- Instant UI response (stale data)
- Background refresh (fresh data)
- Best of both worlds: speed + freshness

## Cache Headers

### API Response Headers
```http
Cache-Control: public, max-age=60, stale-while-revalidate=300
ETag: "abc123def456"
Last-Modified: Wed, 07 Aug 2024 12:00:00 GMT
```

### Request Headers (Conditional)
```http
If-None-Match: "abc123def456"
If-Modified-Since: Wed, 07 Aug 2024 12:00:00 GMT
```

## Debugging Cache Issues

### Check Cache Status
```typescript
// In browser console
console.log(localStorage.getItem('memory-garden-cache'))
```

### Force Cache Refresh
```typescript
import { clearAllCache } from '@/lib/hooks/use-cache'
clearAllCache() // Clear all cached data
```

### Network Tab Inspection
- Status 200: Fresh from server
- Status 304: Not modified (conditional request)
- (memory cache): Served from browser memory
- (disk cache): Served from browser disk cache

## Best Practices

### Do's ✅
- Use longer TTL for stable data (topics: 2 min)
- Use shorter TTL for dynamic data (cards: 1 min)
- Always invalidate cache on data mutations
- Persist important cache to localStorage

### Don'ts ❌
- Don't cache user-specific data in shared cache
- Don't set TTL too long for frequently changing data
- Don't forget to handle cache invalidation
- Don't bypass cache unnecessarily

## Monitoring

### Cache Hit Rate
Monitor localStorage cache hits vs API calls to measure effectiveness.

### Performance Metrics
- Time to first contentful paint
- API response times  
- Cache miss rates
- User-perceived performance

## Future Improvements

1. **Service Worker Caching**: Offline-first approach
2. **GraphQL Caching**: More granular cache invalidation
3. **CDN Integration**: Global edge caching
4. **Cache Analytics**: Detailed cache performance metrics