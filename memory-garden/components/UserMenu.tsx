'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 bg-gold/20 rounded-full animate-pulse"></div>
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="btn-elvish text-sm py-2 px-4"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gold/10 transition-colors"
      >
        <img
          src={session.user?.image || '/default-avatar.png'}
          alt={session.user?.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
        <span className="font-inter text-sm text-forest">
          {session.user?.name?.split(' ')[0] || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-scroll-white rounded-lg shadow-lg border border-gold/20 z-50">
          <div className="p-3 border-b border-gold/10">
            <p className="font-inter text-sm font-medium text-forest">
              {session.user?.name}
            </p>
            <p className="font-inter text-xs text-forest/60">
              {session.user?.email}
            </p>
          </div>
          
          <div className="py-2">
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