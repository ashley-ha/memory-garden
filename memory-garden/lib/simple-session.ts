// Simple, consistent session management
let memorySessionId: string | null = null;

export function getOrCreateSessionId(): string {
  // Return cached session ID if available (prevents inconsistency)
  if (memorySessionId) {
    return memorySessionId;
  }

  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('memory-garden-session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('memory-garden-session', sessionId);
    }
    memorySessionId = sessionId;
    return sessionId;
  }

  // Server-side fallback
  return 'server-anonymous';
}