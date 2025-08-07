'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoadingUsername, setIsLoadingUsername] = useState(false)
  const router = useRouter()

  // Fetch username when user is authenticated
  useEffect(() => {
    if (session?.user?.id && !username && !isLoadingUsername) {
      setIsLoadingUsername(true)
      fetch('/api/profile')
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then(data => {
          if (data.profile?.username) {
            setUsername(data.profile.username)
          } else if (session.user?.id) {
            // User needs to set username, but only redirect if we have a valid session
            router.push('/onboarding/username')
          }
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err)
          // If there's an error, still allow them to use the app
          // Don't redirect to username setup if there's a fetch error
        })
        .finally(() => {
          setIsLoadingUsername(false)
        })
    }
  }, [session, username, isLoadingUsername, router])

  // Update display username
  const displayUsername = username || session?.user?.username

  if (status === 'loading') {
    return (
      <div className="h-10 w-10 bg-gold/20 rounded-full animate-pulse"></div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => signIn('google')}
          className="btn-elvish text-sm py-2 px-4"
        >
          Sign In with Google
        </button>
        <span className="text-xs text-forest/60">
          (or continue as anonymous)
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gold/10 transition-colors"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user?.username || session.user?.name || 'User'}
            className="w-10 h-10 rounded-full border-2 border-gold/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-gold/20 bg-gold/10 flex items-center justify-center">
            <span className="text-forest text-sm font-medium">
              {(session.user?.username || session.user?.name || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-inter text-sm text-forest">
          {displayUsername || session.user?.name?.split(' ')[0] || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-scroll-white rounded-lg shadow-lg border border-gold/20 z-50">
          <div className="p-3 border-b border-gold/10">
            <p className="font-inter text-sm font-medium text-forest">
              @{displayUsername || 'no-username'}
            </p>
            <p className="font-inter text-xs text-forest/60">
              {session.user?.email}
            </p>
          </div>
          
          <div className="py-2">
            <Link href="/my-scrolls" onClick={() => setIsOpen(false)}>
              <button className="w-full text-left px-4 py-2 text-sm font-inter text-forest hover:bg-gold/10 transition-colors">
                My Scrolls
              </button>
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <button className="w-full text-left px-4 py-2 text-sm font-inter text-forest hover:bg-gold/10 transition-colors">
                Settings
              </button>
            </Link>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="w-full text-left px-4 py-2 text-sm font-inter text-forest hover:bg-gold/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}