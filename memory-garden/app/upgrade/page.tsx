'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface UserUsage {
  usage: {
    topics_created: number
  }
  isPro: boolean
  limits: {
    TOPICS_PER_MONTH: number
    CARDS_PER_TOPIC: number
  }
}

export default function UpgradePage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserUsage()
    }
  }, [session?.user?.id])

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

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    if (!session?.user?.id) {
      alert('Please sign in to upgrade')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (userUsage?.isPro) {
    return (
      <div className="min-h-screen bg-parchment py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-6xl">⭐</span>
            <h1 className="text-elvish-title text-4xl mb-4">Already a Pro Member!</h1>
            <p className="text-forest text-lg">
              You have unlimited access to create topics and flashcards.
            </p>
          </div>
          
          <Link href="/" className="btn-elvish inline-block">
            Back to Memory Garden
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-elvish-title text-4xl mb-4">Upgrade to Memory Garden Pro</h1>
          <p className="text-forest text-lg mb-8">
            Remove all limits and unlock the full potential of collaborative learning
          </p>
          
          {cancelled && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Upgrade cancelled. You can always upgrade later when you're ready!
              </p>
            </div>
          )}

          {userUsage && (
            <div className="mb-8 p-4 bg-gold/10 rounded-lg border border-gold/20 max-w-md mx-auto">
              <h3 className="font-medium text-forest mb-2">Your Current Usage</h3>
              <div className="text-sm text-forest/70">
                Topics this month: {userUsage.usage.topics_created}/{userUsage.limits.TOPICS_PER_MONTH}
              </div>
              <div className="w-full bg-gold/20 rounded-full h-2 mt-2">
                <div
                  className="bg-gold rounded-full h-2"
                  style={{
                    width: `${Math.min((userUsage.usage.topics_created / userUsage.limits.TOPICS_PER_MONTH) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-lg border-2 border-gold/20 p-8 hover:border-gold/40 transition-colors">
            <div className="text-center">
              <h3 className="text-elvish-title text-2xl mb-2">Monthly</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-forest">$4.99</span>
                <span className="text-forest/60">/month</span>
              </div>
              
              <button
                onClick={() => handleUpgrade('monthly')}
                disabled={isLoading || !session}
                className="btn-elvish w-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Upgrade Monthly'}
              </button>

              <div className="text-left space-y-3">
                <h4 className="font-medium text-forest mb-3">Everything in Free, plus:</h4>
                <div className="flex items-center space-x-2">
                  
                  <span className="text-sm text-forest">Unlimited topics per month</span>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <span className="text-sm text-forest">Unlimited flashcards per topic</span>
                </div>
                <div className="flex items-center space-x-2">
               
                  <span className="text-sm text-forest">Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                 
                  <span className="text-sm text-forest">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-lg border-2 border-gold p-8 relative hover:border-gold/60 transition-colors">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gold text-forest px-4 py-1 rounded-full text-sm font-medium">
                Save $12
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-elvish-title text-2xl mb-2">Yearly</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-forest">$50</span>
                <span className="text-forest/60">/year</span>
                <div className="text-sm text-forest/60">
                  ($4/month)
                </div>
              </div>
              
              <button
                onClick={() => handleUpgrade('yearly')}
                disabled={isLoading || !session}
                className="btn-elvish w-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Upgrade Yearly'}
              </button>

              <div className="text-left space-y-3">
                <h4 className="font-medium text-forest mb-3">Everything in Monthly, plus:</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-forest">1 month free</span>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <span className="text-sm text-forest">Best value</span>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <span className="text-sm text-forest">Lock in current pricing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-elvish-title text-2xl text-center mb-8">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-forest mb-2">Can I cancel anytime?</h4>
              <p className="text-forest/70 text-sm">
                Yes! You can cancel your subscription at any time. You'll continue to have Pro access until your current billing period ends.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-forest mb-2">What happens to my content if I cancel?</h4>
              <p className="text-forest/70 text-sm">
                Your created topics and flashcards remain accessible forever. You'll just return to the free tier limits for creating new content.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-forest mb-2">Is my payment information secure?</h4>
              <p className="text-forest/70 text-sm">
                Yes! We use Stripe to process payments, which is the same secure payment system used by millions of businesses worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="text-gold hover:underline">
            ← Back to Memory Garden
          </Link>
        </div>
      </div>
    </div>
  )
}