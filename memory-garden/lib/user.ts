// User management for Memory Garden MVP
import { getOrCreateSessionId } from './simple-session'

// Check if current user created content
export function isUserContent(authorId: string | null): boolean {
  if (!authorId || typeof window === 'undefined') return false
  
  // Use consistent session ID
  const sessionId = getOrCreateSessionId()
  return authorId === sessionId
}