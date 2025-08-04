// Simple session-based user identification for MVP
export function getUserSession(): string {
  if (typeof window !== 'undefined') {
    let session = localStorage.getItem('memory-garden-session')
    if (!session) {
      session = crypto.randomUUID()
      localStorage.setItem('memory-garden-session', session)
    }
    return session
  }
  return 'anonymous'
}

// Spaced repetition interval calculation
export function calculateNextReview(rating: 'again' | 'hard' | 'good' | 'easy'): Date {
  const now = new Date()
  const intervals = {
    again: 1 * 60 * 1000,        // 1 minute
    hard: 10 * 60 * 1000,        // 10 minutes
    good: 24 * 60 * 60 * 1000,   // 1 day
    easy: 4 * 24 * 60 * 60 * 1000 // 4 days
  }
  
  return new Date(now.getTime() + intervals[rating])
}