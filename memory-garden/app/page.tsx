'use client'

import { useState, useEffect } from 'react'
import { TopicCard } from '@/components/TopicCard'
import { CreateTopicModal } from '@/components/CreateTopicModal'
import { UserMenu } from '@/components/UserMenu'
import { TopicWithStats } from '@/lib/types'

export default function Home() {
  const [topics, setTopics] = useState<TopicWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTopics = async (search = '') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('limit', '6') // Limit to top 6 scrolls
      
      const response = await fetch(`/api/topics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchTopics(query)
  }

  const handleCreateTopic = async (title: string, description: string) => {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })

    if (response.ok) {
      fetchTopics(searchQuery) // Refresh the list with current search
    } else {
      throw new Error('Failed to create topic')
    }
  }

  useEffect(() => {
    setIsClient(true)
    fetchTopics()
  }, [])

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
          <h1 className="text-elvish-title text-4xl mb-4">
            Memory Garden
          </h1>
          <p className="text-elvish-body text-sm text-forest/60">
            What wisdom do you seek?
          </p>
        </header>
        
        {/* Search and Create Topic */}
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-md mx-auto mb-4">
            <input
              type="text"
              placeholder="Search the scrolls..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gold/20 bg-white/90 text-forest placeholder-forest/50 focus:outline-none focus:ring-2 focus:ring-gold/50 text-elvish-body"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-elvish"
          >
            📜 New Scroll
          </button>
        </div>
        
        {/* Topics Grid */}
        <div className="max-w-6xl mx-auto">
          {!searchQuery && (
            <div className="text-center mb-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* <p className="text-elvish-body text-sm text-forest/60">
                ⭐ Showing the most beloved scrolls in our garden
              </p> */}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center text-elvish-body">
              Loading scrolls...
            </div>
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
                {topics.map((topic, index) => (
                  <div key={topic.id} className="flow-in" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                    <TopicCard topic={topic} />
                  </div>
                ))}
              </div>
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
