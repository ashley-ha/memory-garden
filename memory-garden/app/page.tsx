'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopicCard } from '@/components/TopicCard'
import { CreateTopicModal } from '@/components/CreateTopicModal'
import { UserMenu } from '@/components/UserMenu'
import { TopicGridSkeleton } from '@/components/TopicCardSkeleton'
import { TopicWithStats } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/simple-session'
import { TbArrowLeftRhombus } from "react-icons/tb"
import { useCache, invalidateCache } from '@/lib/hooks/use-cache'
import { useSession } from 'next-auth/react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const { data: session } = useSession()

  // Cached topics fetcher
  const topicsFetcher = useCallback(async () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (!showAllTopics) params.append('limit', '6')
    
    const response = await fetch(`/api/topics?${params}`)
    if (!response.ok) throw new Error('Failed to fetch topics')
    
    return response.json()
  }, [searchQuery, showAllTopics])

  // Use cached topics data with localStorage persistence
  const {
    data: topics = [],
    isLoading,
    refresh: refreshTopics
  } = useCache(
    `topics-${searchQuery}-${showAllTopics}`,
    topicsFetcher,
    { 
      ttl: 120000, // 2 minutes fresh
      staleWhileRevalidate: 600000, // 10 minutes stale
      persistToLocalStorage: true // Persist across page reloads
    }
  )

  // Fetch saved topics centrally (only once for all cards)
  const savedTopicsFetcher = useCallback(async () => {
    if (!session?.user?.id) return []
    
    const response = await fetch('/api/saved-topics')
    if (!response.ok) return []
    
    const data = await response.json()
    return data.topicIds || []
  }, [session?.user?.id])

  const {
    data: savedTopicIds = [],
    refresh: refreshSavedTopics
  } = useCache(
    `saved-topics-${session?.user?.id || 'none'}`,
    savedTopicsFetcher,
    { 
      ttl: 300000, // 5 minutes fresh
      staleWhileRevalidate: 900000, // 15 minutes stale
      persistToLocalStorage: false // Don't persist sensitive user data
    }
  )

  // Handler to refresh saved topics when a card is saved/unsaved
  const handleSavedTopicsUpdate = useCallback(() => {
    refreshSavedTopics()
  }, [refreshSavedTopics])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowAllTopics(false) // Reset to showing limited topics when searching
    
    // Clear existing timeout
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId)
    }
    
    // Debounce the search - the useCache hook will handle the actual fetching
    const timeoutId = setTimeout(() => {
      // The cache key will change and trigger a new fetch automatically
    }, 300) // 300ms delay
    
    setSearchTimeoutId(timeoutId)
  }

  const handleShowMoreScrolls = () => {
    setShowAllTopics(true)
    // The cache key will change and trigger a new fetch automatically
  }

  const handleCreateTopic = async (title: string, description: string, isAnonymous?: boolean) => {
    // Use centralized session management
    const userSession = getOrCreateSessionId()

    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, isAnonymous, userSession })
    })

    if (response.ok) {
      // Invalidate cache to refresh the topics list
      invalidateCache('topics-')
      refreshTopics()
    } else {
      const errorData = await response.json()
      if (errorData.error === 'LIMIT_REACHED') {
        throw new Error(`LIMIT_REACHED: ${errorData.message}`)
      }
      throw new Error(errorData.message || 'Failed to create topic')
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    // Note: This won't work for authenticated users from homepage context
    // because we don't have session access here. The delete should work
    // from TopicCard component which has session access
    const userSession = getOrCreateSessionId()

    const response = await fetch(`/api/topics/${topicId}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userSession })
    })

    if (response.ok) {
      // Invalidate cache and refresh the list
      invalidateCache('topics-')
      refreshTopics()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete topic')
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId)
      }
    }
  }, [searchTimeoutId])

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!isClient) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gold/20 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gold/10 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        {/* User Menu */}
        <div className="flex justify-end mb-8">
          <UserMenu />
        </div>
        
        {/* Header */}
        <header className="text-center mb-12 fade-in-up">
          <h1 className="font-elvish text-6xl mb-4">
            Memory Garden
          </h1>
          <img src="https://see.fontimg.com/api/rf5/6PPo/NWNmOTE3OTc0ZmFkNDBlNmE0Mzk4ODlmMmU0MWU2MGEudHRm/TWVtb3J5IEdhcmRlbg/elvish.png?r=fs&h=130&w=2000&fg=000000&bg=FFFFFF&tb=1&s=65" alt="Lord of the Rings fonts" className="w-1/5 mx-auto" />
          <p className="text-elvish-body text-sm text-forest/60">
            What wisdom do you seek?
          </p>
        </header>
        
        {/* Search and Create Topic */}
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-md mx-auto mb-4">
            <input
              type="text"
              placeholder="Search the scrolls of knowledge..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gold/20 bg-white/90 text-forest placeholder-forest/50 focus:outline-none focus:ring-2 focus:ring-gold/50 text-elvish-body"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-elvish font-elvish bg-gold/50 text-forest hover:bg-gold/90 transition-all duration-200 p-4"
          >
            📜 New Scroll
          </button>
        </div>
        
        {/* Topics Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Community Scrolls Header */}
          <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-elvish-title text-3xl mb-2">Community Scrolls</h2>
          </div>
          
          {!searchQuery && (
            <div className="text-center mb-6 fade-in-up" style={{ animationDelay: '0.4s' }}>
              {/* <p className="text-elvish-body text-sm text-forest/60">
                ⭐ Showing the most beloved scrolls in our garden
              </p> */}
            </div>
          )}
          
          {isLoading ? (
            <TopicGridSkeleton />
          ) : topics.length === 0 ? (
            <div className="text-center">
              <div className="card-elvish max-w-md mx-auto">
                <h3 className="text-elvish-title text-lg mb-2">
                  {searchQuery ? 'No scrolls found' : 'No scrolls yet'}
                </h3>
                <p className="text-elvish-body text-sm">
                  {searchQuery 
                    ? `No scrolls match "${searchQuery}". Try a different search or create a new scroll!`
                    : 'Be the first to create a scroll and start building our community of learners!'
                  }
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic: TopicWithStats) => (
                  <div key={topic.id}>
                    <TopicCard 
                      topic={topic} 
                      onDelete={handleDeleteTopic}
                      savedTopicIds={savedTopicIds}
                      onSavedTopicsUpdate={handleSavedTopicsUpdate}
                    />
                  </div>
                ))}
              </div>
              
              {/* Show "More Scrolls" button only when not searching and not showing all topics */}
              {!searchQuery && !showAllTopics && topics.length === 6 && (
                <div className="text-center mt-8 fade-in-up">
                  <button 
                    onClick={handleShowMoreScrolls}
                    className="btn-elvish font-elvish bg-gold/30 text-forest hover:bg-gold/60 transition-all duration-300 p-3 flex items-center gap-2 mx-auto"
                  >
                    <TbArrowLeftRhombus className="text-lg rotate-90" />
                    More Scrolls
                  </button>
                </div>
              )}
              
              {searchQuery && topics.length > 0 && (
                <div className="text-center mt-6 fade-in-up">
                  <p className="text-elvish-body text-sm text-forest/60">
                    Found {topics.length} scroll{topics.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Create Topic Modal */}
        <CreateTopicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTopic}
        />
      </div>
    </div>
  )
}
