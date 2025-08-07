'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Topic, Card } from '@/lib/types'

interface StudyPageProps {
  params: Promise<{ topicId: string }>
}

export default function StudyPage({ params }: StudyPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ topicId: string } | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [studyComplete, setStudyComplete] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const fetchStudyData = async (topicId: string) => {
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

      // Fetch cards from user's study deck for this topic
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      const cardsResponse = await fetch(`/api/user-study-deck?userId=${session.user.id}&topicId=${topicId}`)
      if (cardsResponse.ok) {
        const studyCards = await cardsResponse.json()
        setCards(studyCards)
      }
    } catch (error) {
      console.error('Failed to fetch study data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams?.topicId && session) {
      fetchStudyData(resolvedParams.topicId)
    }
  }, [resolvedParams, session])

  const currentCard = cards[currentCardIndex]

  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    try {
      const { getOrCreateSessionId } = await import('@/lib/simple-session')
      const userSession = getOrCreateSessionId()
      
      // Submit rating for spaced repetition
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          rating,
          userSession
        })
      })
    } catch (error) {
      console.error('Failed to record review:', error)
    }
    
    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      setStudyComplete(true)
    }
  }

  // Authentication guard
  if (!session) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-elvish">
              <h2 className="text-elvish-title text-2xl mb-4">Login Required</h2>
              <p className="text-elvish-body mb-6">
                You need to be logged in to access your personal study deck. Please sign in to continue.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/api/auth/signin'}
                  className="btn-elvish w-full"
                >
                  Sign In
                </button>
                <Link href="/">
                  <button className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest w-full">
                    Return Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !topic) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-elvish-body">Loading study session...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-elvish">
              <h2 className="text-elvish-title text-2xl mb-4">No Cards in Study Deck</h2>
              <p className="text-elvish-body mb-6">
                No cards have been added to the study deck for this topic yet. 
                Visit the topic page to add cards to your study deck.
              </p>
              <Link href={`/topic/${topic.id}`}>
                <button className="btn-elvish">
                  View Topic Cards
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (studyComplete) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-elvish">
              <h2 className="text-elvish-title text-2xl mb-4">Study Complete!</h2>
              <p className="text-elvish-body mb-6">
                You've reviewed all {cards.length} cards for {topic.title}. 
                Your knowledge grows like starlight.
              </p>
              <div className="space-y-3">
                <Link href={`/topic/${topic.id}`}>
                  <button className="btn-elvish w-full">
                    View Topic
                  </button>
                </Link>
                <Link href="/">
                  <button className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest w-full">
                    Return Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <Link href={`/topic/${topic.id}`} className="text-gold hover:text-gold/80 font-inter text-sm">
              ← Back to {topic.title}
            </Link>
          </div>
          <h1 className="text-elvish-title text-2xl mb-2">{topic.title}</h1>
          <p className="text-elvish-body text-sm text-forest/60">
            Card {currentCardIndex + 1} of {cards.length}
          </p>
        </header>

        {/* Study Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card-elvish min-h-[300px] flex flex-col">
            {/* Card Type Badge */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-inter px-3 py-1 bg-gold/20 text-gold rounded capitalize">
                {currentCard.type}
              </span>
              <div className="text-xs text-forest/60 font-inter">
                {currentCard.helpful_count} found helpful
              </div>
            </div>

            {/* Card Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center w-full">
                {currentCard.front_content ? (
                  // Flashcard display
                  <div className="space-y-6">
                    {!showAnswer ? (
                      // Front of flashcard
                      <div className="p-6 bg-gold/5 border-2 border-gold/20 rounded-lg">
                        <p className="text-xs font-medium text-gold mb-2">QUESTION</p>
                        <p className="text-elvish-body text-lg leading-relaxed">
                          {currentCard.front_content}
                        </p>
                      </div>
                    ) : (
                      // Show both front and back
                      <div className="space-y-4">
                        <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg">
                          <p className="text-xs font-medium text-gold mb-1">QUESTION</p>
                          <p className="text-elvish-body text-sm">
                            {currentCard.front_content}
                          </p>
                        </div>
                        <div className="p-6 bg-sage/5 border-2 border-sage/20 rounded-lg">
                          <p className="text-xs font-medium text-sage mb-2">ANSWER</p>
                          <p className="text-elvish-body text-lg leading-relaxed">
                            {currentCard.back_content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular card display
                  <p className="text-elvish-body text-lg leading-relaxed mb-6">
                    {currentCard.content}
                  </p>
                )}
                
                <div className="text-sm text-forest/60 font-inter mt-6">
                  {currentCard.author_name ? `wisdom by ${currentCard.author_name}` : 'wisdom shared anonymously'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8">
              {!showAnswer ? (
                <div className="text-center">
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="btn-elvish"
                  >
                    {currentCard.front_content ? 'Reveal Answer' : 'Show Rating'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-center text-elvish-body text-sm mb-4">
                    How well did you understand this?
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => handleRating('again')}
                      className="btn-elvish bg-bronze text-white hover:bg-bronze/90 text-sm py-2"
                    >
                      Again
                    </button>
                    <button 
                      onClick={() => handleRating('hard')}
                      className="btn-elvish bg-elvish-body/80 text-white hover:bg-elvish-body/90 text-sm py-2"
                    >
                      Hard
                    </button>
                    <button 
                      onClick={() => handleRating('good')}
                      className="btn-elvish bg-forest text-white hover:bg-forest/90 text-sm py-2"
                    >
                      Good
                    </button>
                    <button 
                      onClick={() => handleRating('easy')}
                      className="btn-elvish bg-sage text-white hover:bg-sage/90 text-sm py-2"
                    >
                      Easy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="bg-scroll-white rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gold h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
            <p className="text-center text-xs text-forest/60 font-inter mt-2">
              {currentCardIndex + 1} of {cards.length} memories strengthened
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}