'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Give Stripe webhook a moment to process
      const timer = setTimeout(() => {
        setIsVerified(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {!isVerified ? (
          <>
            <div className="mb-8">
              <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-elvish-title text-3xl mb-4">Processing your upgrade...</h1>
              <p className="text-forest text-lg">
                We're activating your Pro membership. This should only take a moment.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-elvish-title text-4xl mb-4">Welcome to Memory Garden Pro!</h1>
              <p className="text-forest text-lg mb-8">
                Your subscription is now active. You have unlimited access to create topics and flashcards!
              </p>
            </div>

            <div className="bg-gold/10 rounded-lg border border-gold/20 p-6 mb-8">
              <h3 className="font-medium text-forest mb-4">What's New:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-gold">✨</span>
                  <span className="text-sm text-forest">Create unlimited topics each month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gold">✨</span>
                  <span className="text-sm text-forest">Add unlimited flashcards to any topic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gold">✨</span>
                  <span className="text-sm text-forest">Priority support when you need help</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/" className="btn-elvish inline-block">
                Start Creating Topics
              </Link>
              
              <div className="text-sm text-forest/60">
                <p>
                  Questions about your subscription? Contact me at{' '}
                  <a href="mailto:ashleyha0317@gmail.com" className="text-gold hover:underline">
                    ashleyha0317@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-elvish-title text-3xl mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}