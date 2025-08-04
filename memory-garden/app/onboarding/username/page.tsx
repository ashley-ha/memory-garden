'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UsernameOnboarding() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already has username
  if (session?.user?.username) {
    router.push('/')
    return null
  }

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError('')

    try {
      // Instead of using RPC function, directly query the user_profiles table
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', value)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which means username is available
        throw error
      }
      
      // If data exists, username is taken. If no data (error PGRST116), it's available
      setIsAvailable(!data)
    } catch (err) {
      console.error('Error checking username:', err)
      // If there's an error, assume username is available to not block the user
      setIsAvailable(true)
      setError('Could not check availability. Username will be validated on submit.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(value)
    
    if (value !== username) {
      setIsAvailable(null)
      if (value.length >= 3) {
        // Debounce the check
        const timer = setTimeout(() => checkUsernameAvailability(value), 500)
        return () => clearTimeout(timer)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id || username.length < 3) return

    setIsSubmitting(true)
    setError('')

    try {
      // Use the API endpoint instead of direct Supabase calls
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      // Update session
      await update()
      
      // Redirect to home
      router.push('/')
    } catch (err: any) {
      console.error('Error creating profile:', err)
      const errorMessage = err.message || 'Failed to create profile'
      
      if (errorMessage.includes('already taken')) {
        setError('This username is already taken')
        setIsAvailable(false)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card-elvish text-center">
          <h1 className="text-elvish-title text-2xl mb-4">
            Welcome to Memory Garden!
          </h1>
          <p className="text-elvish-body mb-8">
            Choose a unique username to begin your journey of wisdom
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-forest mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/60">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="input-elvish w-full pl-8"
                  placeholder="yourname"
                  minLength={3}
                  maxLength={20}
                  required
                  autoFocus
                />
                {isChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  </div>
                )}
                {!isChecking && isAvailable === true && username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sage">
                    ✓
                  </div>
                )}
                {!isChecking && isAvailable === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-bronze">
                    ✗
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs">
                {isAvailable === true && username.length >= 3 && (
                  <p className="text-sage">Username is available!</p>
                )}
                {isAvailable === false && (
                  <p className="text-bronze">Username is already taken</p>
                )}
                {username.length > 0 && username.length < 3 && (
                  <p className="text-forest/60">Username must be at least 3 characters</p>
                )}
                {username.length === 0 && (
                  <p className="text-forest/60">Letters, numbers, and underscores only</p>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-bronze bg-bronze/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isAvailable || username.length < 3 || isSubmitting}
              className="btn-elvish w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Profile...' : 'Continue to Memory Garden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}