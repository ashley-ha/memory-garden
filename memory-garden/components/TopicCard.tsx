import Link from 'next/link'
import { TopicWithStats } from '@/lib/types'
import { useState, useEffect } from 'react'
import { getOrCreateSessionId } from '@/lib/simple-session'
import { useSession } from 'next-auth/react'

interface TopicCardProps {
  topic: TopicWithStats
  onDelete?: (topicId: string) => Promise<void>
}

export function TopicCard({ topic, onDelete }: TopicCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [canDeleteState, setCanDeleteState] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { data: session } = useSession()

  // Use effect to properly check delete permissions after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let currentUserId = null
      
      // If authenticated, use the session user ID
      if (session?.user?.id) {
        currentUserId = session.user.id
      } else {
        // For anonymous users, use the session ID
        currentUserId = getOrCreateSessionId()
      }
      
      const canUserDelete = topic.author_id === currentUserId
      
      
      setCanDeleteState(canUserDelete)
    }
  }, [topic.author_id, session])

  // Check if topic is saved
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/saved-topics')
        .then(res => res.json())
        .then(data => {
          if (data.topicIds && data.topicIds.includes(topic.id)) {
            setIsSaved(true)
          }
        })
        .catch(err => console.error('Failed to check saved status:', err))
    }
  }, [session, topic.id])

  const handleDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      // Handle delete directly with correct user ID
      let userId = null
      if (session?.user?.id) {
        userId = session.user.id
      } else {
        userId = getOrCreateSessionId()
      }

      const response = await fetch(`/api/topics/${topic.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSession: userId })
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        // Always refresh page after successful delete to ensure clean state
        window.location.reload()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete topic')
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete topic. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session) {
      alert('Please sign in to save topics to your scrolls')
      return
    }
    
    if (isSaving) return
    
    setIsSaving(true)
    try {
      // Use authenticated user ID instead of session ID for saving
      const userId = session.user?.id || getOrCreateSessionId()
      const method = isSaved ? 'DELETE' : 'POST'
      
      const response = await fetch('/api/saved-topics', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: topic.id, userSession: userId })
      })
      
      if (response.ok) {
        setIsSaved(!isSaved)
      } else {
        throw new Error('Failed to update saved status')
      }
    } catch (error) {
      console.error('Failed to save/unsave topic:', error)
      alert('Failed to update. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <>
      <div className="card-elvish group cursor-pointer relative">
        {canDeleteState && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-forest/60 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
            title="Delete this topic"
          >
            ✕
          </button>
        )}
        
        <Link href={`/topic/${topic.id}`}>
          <h3 className="text-elvish-title text-lg mb-2 group-hover:text-gold transition-colors">
            {topic.title}
          </h3>
          <p className="text-elvish-body text-sm mb-4 line-clamp-2">
            {topic.description || 'No description provided'}
          </p>
          <div className="flex justify-between items-center text-xs text-forest/60 font-inter">
            <span>{topic.card_count} cards</span>
            <span>{topic.learner_count} learners</span>
          </div>
        </Link>
        
        <div className="mt-3 pt-3 border-t border-gold/10">
          <div className="flex flex-wrap gap-2">
            <Link href={`/study/${topic.id}`}>
              <button className="btn-elvish text-xs py-2 px-3">
                Study
              </button>
            </Link>
            {session && (
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`btn-elvish text-xs py-2 px-3 ${
                  isSaved 
                    ? 'bg-sage/20 text-sage border-sage' 
                    : 'bg-transparent border border-bronze text-bronze hover:bg-bronze hover:text-white'
                } disabled:opacity-50`}
              >
                {isSaving ? '...' : isSaved ? 'Saved' : 'Add to My Scrolls'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-parchment p-6 rounded-lg border border-gold/30 max-w-md mx-4">
            <h3 className="text-elvish-title text-lg mb-4">Delete Topic?</h3>
            {topic.learner_count > 50 && (
              <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded">
                <p className="text-elvish-body text-sm font-semibold text-gold">
                  ⚠️ You have {topic.learner_count} learners using this scroll.
                </p>
              </div>
            )}
            <p className="text-elvish-body text-sm mb-6">
              Are you sure you want to delete "{topic.title}"? This will also delete all cards in this topic. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-elvish bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}