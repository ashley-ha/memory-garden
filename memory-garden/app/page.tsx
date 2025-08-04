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

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics')
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

  const handleCreateTopic = async (title: string, description: string) => {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })

    if (response.ok) {
      fetchTopics() // Refresh the list
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
            ✨ Memory Garden ✨
          </h1>
          <p className="text-elvish-body text-lg mb-2">
            "The Last Homely House East of the Sea"
          </p>
          <p className="text-elvish-body text-sm text-forest/60">
            What wisdom do you seek?
          </p>
        </header>
        
        {/* Create Topic Button */}
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-elvish"
          >
            ✨ Begin New Study
          </button>
        </div>
        
        {/* Topics Grid */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center text-elvish-body">
              Loading topics...
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center">
              <div className="card-elvish max-w-md mx-auto">
                <h3 className="text-elvish-title text-lg mb-2">No topics yet</h3>
                <p className="text-elvish-body text-sm">
                  Be the first to create a topic and start building our community of learners!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, index) => (
                <div key={topic.id} className="flow-in" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <TopicCard topic={topic} />
                </div>
              ))}
            </div>
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
