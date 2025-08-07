'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CreateTopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string, isAnonymous?: boolean) => Promise<void>
}

interface UserUsage {
  usage: {
    topics_created: number
  }
  isPro: boolean
  limits: {
    TOPICS_PER_MONTH: number
    CARDS_PER_TOPIC: number
  }
  canCreateTopic: boolean
}

export function CreateTopicModal({ isOpen, onClose, onSubmit }: CreateTopicModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [error, setError] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchUserUsage()
    }
  }, [isOpen, session?.user?.id])

  const fetchUserUsage = async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUserUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit(title.trim(), description.trim(), isAnonymous)
      setTitle('')
      setDescription('')
      setIsAnonymous(false)
      onClose()
    } catch (error: any) {
      console.error('Failed to create topic:', error)
      if (error.message.includes('LIMIT_REACHED')) {
        setError(error.message.replace('Error: ', ''))
        fetchUserUsage() // Refresh usage data
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment rounded-lg p-6 w-full max-w-md">
        <h2 className="text-elvish-title text-xl mb-4">Create New Topic</h2>
        
        {/* Usage Display */}
        {session && userUsage && (
          <div className="mb-4 p-3 bg-gold/10 rounded-md border border-gold/20">
            {userUsage.isPro ? (
              <div className="flex items-center space-x-2">
                <span className="text-gold">⭐</span>
                <span className="text-sm font-medium text-forest">Pro Member - Unlimited Topics</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-forest">Topics this month</span>
                  <span className="text-sm text-forest">
                    {userUsage.usage.topics_created}/{userUsage.limits.TOPICS_PER_MONTH}
                  </span>
                </div>
                <div className="w-full bg-gold/20 rounded-full h-2">
                  <div
                    className="bg-gold rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${Math.min((userUsage.usage.topics_created / userUsage.limits.TOPICS_PER_MONTH) * 100, 100)}%`
                    }}
                  />
                </div>
                {userUsage.usage.topics_created >= userUsage.limits.TOPICS_PER_MONTH && (
                  <div className="mt-2 p-2 bg-bronze/20 rounded border border-bronze/30">
                    <p className="text-sm text-forest">
                      You've reached your monthly limit. 
                      <button 
                        type="button"
                        className="ml-1 text-gold hover:underline font-medium"
                        onClick={() => window.open('/upgrade', '_blank')}
                      >
                        Upgrade to Pro
                      </button> for unlimited topics!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Topic Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-elvish w-full"
              placeholder="What would you like to learn?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-elvish w-full h-24 resize-none"
              placeholder="Briefly describe what this topic covers..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gold/30 text-gold focus:ring-gold/50"
              />
              <span className="text-sm font-medium text-forest">
                Create anonymously
              </span>
            </label>
            <p className="text-xs text-forest/60 mt-1">
              {session ? (
                isAnonymous 
                  ? "This topic will be shared anonymously. You can still delete it later."
                  : `This topic will be credited to "${session.user?.name || 'You'}". You can delete it later.`
              ) : (
                "You're browsing anonymously. You can still delete content you create."
              )}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || (userUsage?.canCreateTopic === false)}
              className="btn-elvish flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('')
                setDescription('')
                setIsAnonymous(false)
                onClose()
              }}
              className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}