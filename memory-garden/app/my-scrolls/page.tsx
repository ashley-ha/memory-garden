'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopicWithStats, Card } from '@/lib/types'
import { TopicCard } from '@/components/TopicCard'
import { getOrCreateSessionId } from '@/lib/simple-session'

interface UserScrolls {
  savedTopics: TopicWithStats[]
  createdCards: {
    card: Card
    topic: { id: string; title: string }
  }[]
}

export default function MyScrollsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scrolls, setScrolls] = useState<UserScrolls>({ savedTopics: [], createdCards: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchUserScrolls()
  }, [session, status, router])

  const fetchUserScrolls = async () => {
    try {
      setIsLoading(true)
      
      // Fetch saved topics
      const savedResponse = await fetch('/api/my-scrolls')
      if (savedResponse.ok) {
        const data = await savedResponse.json()
        setScrolls(data)
      }
    } catch (error) {
      console.error('Failed to fetch scrolls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    // This will be handled by the TopicCard component
    // Just refresh the list after deletion
    fetchUserScrolls()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-elvish-body">Loading your scrolls...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 fade-in-up">
          <Link href="/" className="text-gold hover:text-gold/80 font-inter text-sm inline-block mb-4">
            ← Back to Garden
          </Link>
          <h1 className="text-elvish-title text-3xl mb-4">My Scrolls</h1>
          <p className="text-elvish-body text-sm text-forest/60">
            Your personal collection of wisdom
          </p>
        </header>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-2 rounded-t-lg font-inter text-sm transition-colors ${
                activeTab === 'saved'
                  ? 'bg-gold text-forest'
                  : 'bg-transparent text-forest/60 hover:text-forest'
              }`}
            >
              Saved Topics ({scrolls.savedTopics.length})
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`px-6 py-2 rounded-t-lg font-inter text-sm transition-colors ${
                activeTab === 'created'
                  ? 'bg-gold text-forest'
                  : 'bg-transparent text-forest/60 hover:text-forest'
              }`}
            >
              My Cards ({scrolls.createdCards.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'saved' ? (
            scrolls.savedTopics.length === 0 ? (
              <div className="text-center">
                <div className="card-elvish max-w-md mx-auto">
                  <h3 className="text-elvish-title text-lg mb-2">No saved topics yet</h3>
                  <p className="text-elvish-body text-sm mb-4">
                    Explore the garden and save topics you want to study later!
                  </p>
                  <Link href="/">
                    <button className="btn-elvish">
                      Explore Topics
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scrolls.savedTopics.map((topic, index) => (
                  <div key={topic.id} className="flow-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <TopicCard topic={topic} onDelete={handleDeleteTopic} />
                  </div>
                ))}
              </div>
            )
          ) : (
            scrolls.createdCards.length === 0 ? (
              <div className="text-center">
                <div className="card-elvish max-w-md mx-auto">
                  <h3 className="text-elvish-title text-lg mb-2">No cards created yet</h3>
                  <p className="text-elvish-body text-sm mb-4">
                    Share your wisdom by creating cards for topics!
                  </p>
                  <Link href="/">
                    <button className="btn-elvish">
                      Find Topics
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {scrolls.createdCards.map((item, index) => (
                  <div 
                    key={item.card.id} 
                    className="card-elvish flow-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link 
                          href={`/topic/${item.topic.id}`}
                          className="text-elvish-title text-sm hover:text-gold transition-colors"
                        >
                          {item.topic.title}
                        </Link>
                        <span className="text-xs font-inter px-2 py-1 ml-2 bg-gold/20 text-gold rounded capitalize">
                          {item.card.type}
                        </span>
                      </div>
                      <div className="text-xs text-forest/60 font-inter">
                        {item.card.helpful_count} found helpful
                      </div>
                    </div>
                    
                    <p className="text-elvish-body mb-3">{item.card.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-forest/60 font-inter">
                        Created {new Date(item.card.created_at).toLocaleDateString()}
                      </div>
                      <Link href={`/topic/${item.topic.id}`}>
                        <button className="text-xs px-3 py-1 bg-gold/20 text-gold hover:bg-gold hover:text-forest rounded transition-colors">
                          View Topic
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}