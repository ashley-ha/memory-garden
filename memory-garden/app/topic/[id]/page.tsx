'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Topic, Card } from '@/lib/types'

interface TopicPageProps {
  params: Promise<{ id: string }>
}

export default function TopicPage({ params }: TopicPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCardForm, setShowCardForm] = useState(false)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const fetchTopicData = async (topicId: string) => {
    try {
      // Fetch topic details
      const topicResponse = await fetch('/api/topics')
      if (topicResponse.ok) {
        const topics = await topicResponse.json()
        const foundTopic = topics.find((t: any) => t.id === topicId)
        if (foundTopic) {
          setTopic(foundTopic)
        }
      }

      // Fetch cards
      const cardsResponse = await fetch(`/api/cards?topicId=${topicId}`)
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData)
      }
    } catch (error) {
      console.error('Failed to fetch topic data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchTopicData(resolvedParams.id)
    }
  }, [resolvedParams])

  if (isLoading || !topic) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-elvish-body">Loading topic...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="text-gold hover:text-gold/80 font-inter text-sm">
            ← Back to Topics
          </Link>
        </div>

        {/* Topic Header */}
        <header className="text-center mb-12 fade-in-up">
          <h1 className="text-elvish-title text-3xl mb-4">{topic.title}</h1>
          <p className="text-elvish-body text-lg mb-2">
            {topic.description}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href={`/study/${topic.id}`}>
              <button className="btn-elvish">
                Study
              </button>
            </Link>
            <button 
              onClick={() => setShowCardForm(!showCardForm)}
              className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest"
            >
            Contribute Wisdom
            </button>
          </div>
        </header>

        {/* Card Creation Form */}
        {showCardForm && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="card-elvish">
              <h3 className="text-elvish-title text-lg mb-4">Share Your Wisdom</h3>
              <CardForm 
                onCancel={() => setShowCardForm(false)} 
                topicId={topic.id}
                onCardCreated={() => fetchTopicData(topic.id)}
              />
            </div>
          </div>
        )}

        {/* Cards Display */}
        <div className="max-w-4xl mx-auto">
          {cards.length === 0 ? (
            <div className="text-center">
              <div className="card-elvish max-w-md mx-auto">
                <h3 className="text-elvish-title text-lg mb-2">No cards yet</h3>
                <p className="text-elvish-body text-sm">
                  Be the first to contribute wisdom for this topic!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-elvish-title text-xl text-center mb-6">
                Scrolls of Wisdom ({cards.length})
              </h2>
              
              {/* Group cards by type */}
              {['analogy', 'definition', 'knowledge'].map((cardType) => {
                const typeCards = cards.filter(card => card.type === cardType)
                if (typeCards.length === 0) return null
                
                const getCardTypeTitle = (type: string) => {
                  switch (type) {
                    case 'analogy': return 'Analogies'
                    case 'definition': return 'Definitions'
                    case 'knowledge': return 'Knowledge Sharing'
                    default: return type
                  }
                }
                
                return (
                  <div key={cardType} className="space-y-4">
                    <h3 className="text-elvish-title text-lg capitalize">
                      {getCardTypeTitle(cardType)}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {typeCards.map((card) => (
                        <CardDisplay key={card.id} card={card} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CardForm({ onCancel, topicId, onCardCreated }: { 
  onCancel: () => void
  topicId: string
  onCardCreated: () => void
}) {
  const [type, setType] = useState<'analogy' | 'definition' | 'knowledge'>('analogy')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          type,
          content
        })
      })

      if (response.ok) {
        onCardCreated() // Refresh the cards list
        onCancel() // Close the form
      } else {
        throw new Error('Failed to create card')
      }
    } catch (error) {
      console.error('Failed to create card:', error)
      alert('Failed to create card. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-forest mb-2">
          Type of Wisdom
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="cardType"
              value="analogy"
              checked={type === 'analogy'}
              onChange={() => setType('analogy')}
              className="mr-2"
            />
            <span className="text-sm">Analogy</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="cardType"
              value="definition"
              checked={type === 'definition'}
              onChange={() => setType('definition')}
              className="mr-2"
            />
            <span className="text-sm">Definition</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="cardType"
              value="knowledge"
              checked={type === 'knowledge'}
              onChange={() => setType('knowledge')}
              className="mr-2"
            />
            <span className="text-sm">Knowledge</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-forest mb-1">
          {type === 'analogy' ? 'Your Analogy' : type === 'definition' ? 'Your Definition' : 'Your Knowledge'}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-elvish w-full h-32 resize-none"
          placeholder={
            type === 'analogy' 
              ? "Explain this concept using a relatable comparison..."
              : type === 'definition'
              ? "Provide a clear, precise definition..."
              : "Share practical knowledge, insights, or facts about this topic..."
          }
          required
        />
      </div>


      <div className="flex space-x-3">
        <button 
          type="submit" 
          disabled={isSubmitting || !content.trim()}
          className="btn-elvish flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sharing...' : 'Share Wisdom'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest flex-1 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function CardDisplay({ card }: { card: Card }) {
  const [hasVoted, setHasVoted] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(card.helpful_count)
  const [isVoting, setIsVoting] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)

  const handleVote = async () => {
    if (hasVoted || isVoting) return
    
    setIsVoting(true)
    try {
      // Simple session generation for anonymous users
      let userSession = 'anonymous'
      if (typeof window !== 'undefined') {
        userSession = localStorage.getItem('memory-garden-session') || crypto.randomUUID()
        if (!localStorage.getItem('memory-garden-session')) {
          localStorage.setItem('memory-garden-session', userSession)
        }
      }
      
      const response = await fetch(`/api/cards/${card.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSession })
      })

      if (response.ok) {
        const data = await response.json()
        setHasVoted(true)
        setHelpfulCount(prev => prev + 1)
        // Show sparkle animation
        setShowSparkle(true)
        setTimeout(() => setShowSparkle(false), 600)
      } else {
        const error = await response.json()
        if (error.error && error.error.includes('already voted')) {
          setHasVoted(true)
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="card-elvish">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-inter px-2 py-1 bg-gold/20 text-gold rounded capitalize">
          {card.type}
        </span>
        <div className="text-xs text-forest/60 font-inter">
          {helpfulCount} found helpful
        </div>
      </div>
      
      <p className="text-elvish-body mb-4">{card.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-forest/60 font-inter">
          {card.author_name ? `shared by ${card.author_name}` : 'shared anonymously'}
        </div>
        <button
          onClick={handleVote}
          disabled={hasVoted || isVoting}
          className={`text-xs px-3 py-1 rounded transition-colors ${
            hasVoted 
              ? 'bg-sage/20 text-sage cursor-not-allowed' 
              : 'bg-gold/20 text-gold hover:bg-gold hover:text-forest disabled:opacity-50'
          } ${showSparkle ? 'sparkle-animation' : ''}`}
        >
          {isVoting ? 'Voting...' : hasVoted ? '⭐ Helpful!' : 'Mark Helpful'}
        </button>
      </div>
    </div>
  )
}