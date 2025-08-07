// Server-side caching utilities for Next.js API routes
import { NextResponse } from 'next/server'
import crypto from 'crypto'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  staleWhileRevalidate?: number // Stale while revalidate in seconds
  tags?: string[] // Cache tags for revalidation
  generateEtag?: boolean // Generate ETag header
}

function generateETag(data: any): string {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(data))
  return `"${hash.digest('hex')}"`
}

export function createCachedResponse<T>(
  data: T, 
  options: CacheOptions = {}
): NextResponse {
  const {
    ttl = 60, // 1 minute default
    staleWhileRevalidate = 300, // 5 minutes default
    tags = [],
    generateEtag = true
  } = options

  const response = NextResponse.json(data)
  
  // Set cache headers for better browser caching
  response.headers.set(
    'Cache-Control', 
    `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
  )
  
  // Add ETag for conditional requests
  if (generateEtag) {
    const etag = generateETag(data)
    response.headers.set('ETag', etag)
  }
  
  // Add Last-Modified header
  response.headers.set('Last-Modified', new Date().toUTCString())
  
  // Set cache tags for Next.js revalidation
  if (tags.length > 0) {
    response.headers.set('Cache-Tag', tags.join(','))
  }
  
  return response
}

export function createInvalidationResponse(data: any, invalidationTags: string[] = []): NextResponse {
  const response = NextResponse.json(data)
  
  // Add cache invalidation headers
  if (invalidationTags.length > 0) {
    response.headers.set('X-Cache-Invalidate-Tags', invalidationTags.join(','))
  }
  
  return response
}

// Fetch with Next.js caching
export async function fetchWithCache(
  url: string,
  options: RequestInit & { 
    cache?: RequestCache;
    next?: { 
      revalidate?: number | false;
      tags?: string[];
    };
  } = {}
) {
  const defaultOptions: RequestInit & { next?: any } = {
    cache: 'force-cache',
    next: {
      revalidate: 60, // Revalidate every minute
      tags: []
    },
    ...options
  }
  
  return fetch(url, defaultOptions)
}