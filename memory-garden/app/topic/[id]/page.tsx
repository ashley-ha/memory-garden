'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Topic, Card } from '@/lib/types'
import { isUserContent } from '@/lib/user'
import { getOrCreateSessionId } from '@/lib/simple-session'

interface TopicPageProps {
  params: Promise<{ id: string }>
}

export default function TopicPage({ params }: TopicPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCardForm, setShowCardForm] = useState(false)
  const [showStudyLoginPrompt, setShowStudyLoginPrompt] = useState(false)
  const { data: session } = useSession()

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

      // Fetch cards with user session for study deck status
      const userSession = getOrCreateSessionId()
      const cardsResponse = await fetch(`/api/cards?topicId=${topicId}&userId=${userSession}`)
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
            {session ? (
              <Link href={`/study/${topic.id}`}>
                <button className="btn-elvish">
                  Study {cards.filter(c => c.in_study_deck).length > 0 ? `(${cards.filter(c => c.in_study_deck).length})` : ''}
                </button>
              </Link>
            ) : (
              <button 
                onClick={() => setShowStudyLoginPrompt(true)}
                className="btn-elvish bg-gold/10 text-gold hover:bg-gold hover:text-forest"
              >
                🔐 Login to Study
              </button>
            )}
            <button 
              onClick={() => setShowCardForm(!showCardForm)}
              className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest"
            >
            Contribute Wisdom
            </button>
          </div>
          
          {/* Study deck status */}
          <div className="text-center mt-2 text-xs text-forest/60">
            {!session
              ? "Login to create your personal study deck"
              : cards.filter(c => c.in_study_deck).length === 0 
                ? "Add cards to your study deck to begin studying"
                : `${cards.filter(c => c.in_study_deck).length} cards in your study deck`
            }
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

        {/* Study Login Prompt Modal */}
        {showStudyLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-parchment p-6 rounded-lg border border-gold/30 max-w-md mx-4">
              <h3 className="text-elvish-title text-lg mb-4">Login Required for Study Mode</h3>
              <p className="text-elvish-body text-sm mb-6">
                Study mode allows you to create a personalized flashcard deck and track your learning progress. To use this feature, please sign in to your account.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowStudyLoginPrompt(false)}
                  className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStudyLoginPrompt(false)
                    window.location.href = '/api/auth/signin'
                  }}
                  className="btn-elvish"
                >
                  Sign In
                </button>
              </div>
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
                        <CardDisplay 
                          key={card.id} 
                          card={card} 
                          onCardDeleted={() => fetchTopicData(topic.id)}
                        />
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
  const [isFlashcard, setIsFlashcard] = useState(true) // Default to flashcard for definition/knowledge
  const [content, setContent] = useState('') // For general wisdom
  const [frontContent, setFrontContent] = useState('') // For flashcard front
  const [backContent, setBackContent] = useState('') // For flashcard back
  const [sources, setSources] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get the session ID to send to the API
      const userSession = getOrCreateSessionId()

      // Prepare the data based on whether it's a flashcard or general wisdom
      const cardData: any = {
        topicId,
        type,
        sources: sources.trim() || null, // Send raw sources string, API will process it
        isAnonymous,
        userSession
      }

      // For definition/knowledge cards, check if it's a flashcard
      if ((type === 'definition' || type === 'knowledge') && isFlashcard) {
        cardData.frontContent = frontContent.trim()
        cardData.backContent = backContent.trim()
      } else {
        cardData.content = content.trim()
      }

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
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
              onChange={() => {
                setType('analogy')
                setIsFlashcard(false) // Analogies are never flashcards
              }}
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
              onChange={() => {
                setType('definition')
                setIsFlashcard(true) // Default to flashcard for definitions
              }}
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
              onChange={() => {
                setType('knowledge')
                setIsFlashcard(true) // Default to flashcard for knowledge
              }}
              className="mr-2"
            />
            <span className="text-sm">Knowledge</span>
          </label>
        </div>
      </div>

      {/* Flashcard toggle for definition/knowledge cards */}
      {(type === 'definition' || type === 'knowledge') && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!isFlashcard}
              onChange={(e) => setIsFlashcard(!e.target.checked)}
              className="rounded border-gold/30 text-gold focus:ring-gold/50"
            />
            <span className="text-sm font-medium text-forest">
              Contribute general wisdom instead
            </span>
          </label>
          <p className="text-xs text-forest/60 mt-1">
            {isFlashcard 
              ? "Create a flashcard with a question/prompt on the front and answer on the back"
              : "Share wisdom or insights without the flashcard format"
            }
          </p>
        </div>
      )}

      {/* Content fields based on card type and format */}
      {type === 'analogy' || !isFlashcard ? (
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
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Front (Question/Prompt)
            </label>
            <textarea
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              className="input-elvish w-full h-24 resize-none"
              placeholder={
                type === 'definition'
                  ? "What is [concept]?"
                  : "Question or prompt that tests understanding..."
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Back (Answer/Explanation)
            </label>
            <textarea
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              className="input-elvish w-full h-32 resize-none"
              placeholder={
                type === 'definition'
                  ? "A clear, precise definition of the concept..."
                  : "The answer or explanation..."
              }
              required
            />
          </div>
        </>
      )}

      {/* Sources field - show for all cards */}
      <div>
        <label className="block text-sm font-medium text-forest mb-1">
          Sources <span className="text-forest/60 text-xs">(optional)</span>
        </label>
        <textarea
          value={sources}
          onChange={(e) => setSources(e.target.value)}
          className="input-elvish w-full h-20 resize-none"
          placeholder="Add source URLs, one per line:
https://example.com/article
https://wikipedia.org/wiki/topic"
        />
        <p className="text-xs text-forest/60 mt-1">
          Add links to articles, papers, or resources that support this {type}. One URL per line.
        </p>
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
            Share anonymously
          </span>
        </label>
        <p className="text-xs text-forest/60 mt-1">
          {session ? (
            isAnonymous 
              ? "This card will be shared anonymously. You can still delete it later."
              : `This card will be credited to "${session.user?.name || 'You'}". You can delete it later.`
          ) : (
            "You're browsing anonymously. You can still delete content you create."
          )}
        </p>
      </div>

      <div className="flex space-x-3">
        <button 
          type="submit" 
          disabled={isSubmitting || (
            (type === 'analogy' || !isFlashcard) 
              ? !content.trim() 
              : (!frontContent.trim() || !backContent.trim())
          )}
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

function CardDisplay({ card, onCardDeleted }: { card: Card, onCardDeleted: () => void }) {
  const [hasVoted, setHasVoted] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(card.helpful_count)
  const [isVoting, setIsVoting] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [inStudyDeck, setInStudyDeck] = useState(card.in_study_deck)
  const [isTogglingStudyDeck, setIsTogglingStudyDeck] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { data: session } = useSession()

  // Check if current user can delete this card
  const canDelete = () => {
    if (typeof window === 'undefined') return false
    
    // Use the new user system to check if user created this card
    return isUserContent(card.author_id || null)
  }

  const handleVote = async () => {
    if (hasVoted || isVoting) return
    
    setIsVoting(true)
    try {
      // Use centralized session management
      const userSession = getOrCreateSessionId()
      
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

  const handleDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      // Use centralized session management
      const userSession = getOrCreateSessionId()

      const response = await fetch(`/api/cards/${card.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSession })
      })

      if (response.ok) {
        onCardDeleted() // Refresh the cards list
        setShowDeleteConfirm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete card')
      }
    } catch (error) {
      console.error('Failed to delete card:', error)
      alert('Failed to delete card. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStudyDeck = async () => {
    if (isTogglingStudyDeck) return
    
    // Check if user is authenticated
    if (!session) {
      setShowLoginPrompt(true)
      return
    }
    
    setIsTogglingStudyDeck(true)
    try {
      const userId = session.user.id
      
      if (inStudyDeck) {
        // Remove from deck
        const response = await fetch(`/api/user-study-deck/${card.id}?userId=${userId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setInStudyDeck(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to remove from study deck')
        }
      } else {
        // Add to deck
        const response = await fetch('/api/user-study-deck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cardId: card.id })
        })
        if (response.ok) {
          setInStudyDeck(true)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to add to study deck')
        }
      }
    } catch (error) {
      console.error('Failed to toggle study deck:', error)
      alert('Failed to update study deck status. Please try again.')
    } finally {
      setIsTogglingStudyDeck(false)
    }
  }

  return (
    <div className="card-elvish">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-inter px-2 py-1 bg-gold/20 text-gold rounded capitalize">
          {card.type}
        </span>
        <div className="flex items-center gap-2">
          <div className="text-xs text-forest/60 font-inter">
            {helpfulCount} found helpful
          </div>
          {canDelete() && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete this scroll"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {/* Card content - show differently for flashcards */}
      {card.front_content ? (
        <div className="space-y-3 mb-4">
          <div className="p-3 bg-gold/5 border border-gold/20 rounded">
            <p className="text-xs font-medium text-forest/80 mb-1">Front:</p>
            <p className="text-elvish-body">{card.front_content}</p>
          </div>
          <div className="p-3 bg-sage/5 border border-sage/20 rounded">
            <p className="text-xs font-medium text-forest/80 mb-1">Back:</p>
            <p className="text-elvish-body">{card.back_content}</p>
          </div>
        </div>
      ) : (
        <p className="text-elvish-body mb-4">{card.content}</p>
      )}
      
      {/* Sources display */}
      {showSources && card.sources && (
        <div className="mb-4 p-3 bg-gold/5 border border-gold/20 rounded">
          <h4 className="text-xs font-medium text-forest mb-2">Sources:</h4>
          <div className="space-y-1">
            {(typeof card.sources === 'string' 
              ? card.sources.split('\n').filter(s => s.trim())
              : card.sources
            ).map((source, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gold">🔗</span>
                <a 
                  href={typeof source === 'string' ? source.trim() : source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest hover:text-gold underline hover:no-underline break-all"
                >
                  {typeof source === 'string' ? source.trim() : source}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="text-xs text-forest/60 font-inter">
          {card.author_name ? `shared by ${card.author_name}` : 'shared anonymously'}
        </div>
        <div className="flex items-center gap-3">
          {/* Show sources button for cards with sources */}
          {card.sources && (
            (typeof card.sources === 'string' ? card.sources.trim() : card.sources.length > 0)
          ) && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs px-3 py-1 bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors flex-1"
            >
              📜 {showSources ? 'Hide' : 'View'} Sources
            </button>
          )}
          {/* Add to Study Deck button */}
          <button
            onClick={handleToggleStudyDeck}
            disabled={isTogglingStudyDeck}
            className={`text-xs px-3 py-1 rounded transition-colors flex-1 ${
              !session 
                ? 'bg-gold/10 text-gold hover:bg-gold/20'
                : inStudyDeck 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-forest/10 text-forest hover:bg-forest/20'
            } disabled:opacity-50`}
          >
            {isTogglingStudyDeck ? '...' : !session ? '🔐 Login to Study' : inStudyDeck ? '✓ In Deck' : '➕ Add to Study'}
          </button>
          <button
            onClick={handleVote}
            disabled={hasVoted || isVoting}
            className={`text-xs px-3 py-1 rounded transition-colors flex-1 ${
              hasVoted 
                ? 'bg-sage/20 text-sage cursor-not-allowed' 
                : 'bg-gold/20 text-gold hover:bg-gold hover:text-forest disabled:opacity-50'
            } ${showSparkle ? 'sparkle-animation' : ''}`}
          >
            {isVoting ? '...' : hasVoted ? '⭐ Helpful!' : 'Mark Helpful'}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-parchment p-6 rounded-lg border border-gold/30 max-w-md mx-4">
            <h3 className="text-elvish-title text-lg mb-4">Delete Scroll?</h3>
            <p className="text-elvish-body text-sm mb-6">
              Are you sure you want to delete this scroll? This action cannot be undone.
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
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-parchment p-6 rounded-lg border border-gold/30 max-w-md mx-4">
            <h3 className="text-elvish-title text-lg mb-4">Login Required</h3>
            <p className="text-elvish-body text-sm mb-6">
              To add cards to your personal study deck, you need to be logged in. This helps us save your progress and sync across devices.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false)
                  window.location.href = '/api/auth/signin'
                }}
                className="btn-elvish"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}