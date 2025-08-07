'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function SubscriptionDebugPage() {
  const { data: session, status } = useSession()
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/subscription')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error fetching debug data:', error)
      setMessage('Error fetching debug data')
    } finally {
      setLoading(false)
    }
  }

  const syncFromStripe = async () => {
    if (!debugData?.supabaseSubscription?.stripe_customer_id) {
      setMessage('No Stripe customer ID found')
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/debug/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_from_stripe',
          stripeCustomerId: debugData.supabaseSubscription.stripe_customer_id
        })
      })
      
      const result = await response.json()
      if (response.ok) {
        setMessage('Successfully synced from Stripe! Refresh to see changes.')
        fetchDebugData() // Refresh the data
      } else {
        setMessage(`Sync failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error syncing from Stripe:', error)
      setMessage('Error syncing from Stripe')
    } finally {
      setSyncing(false)
    }
  }

  const forcePro = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/debug/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'force_pro'
        })
      })
      
      const result = await response.json()
      if (response.ok) {
        setMessage('User manually set to Pro status! Refresh to see changes.')
        fetchDebugData() // Refresh the data
      } else {
        setMessage(`Force Pro failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error forcing Pro:', error)
      setMessage('Error forcing Pro status')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchDebugData()
    }
  }, [session])

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>
  }

  if (!session) {
    return <div className="p-8">Please sign in to debug subscription issues.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-scroll-white">
      <h1 className="text-2xl font-cinzel text-forest mb-6">Subscription Debug Tool</h1>
      
      {message && (
        <div className="mb-4 p-4 bg-gold/10 border border-gold/20 rounded-lg">
          <p className="text-forest">{message}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="btn-elvish mr-4"
        >
          {loading ? 'Loading...' : 'Refresh Debug Data'}
        </button>
        
        {debugData?.supabaseSubscription?.stripe_customer_id && (
          <button
            onClick={syncFromStripe}
            disabled={syncing}
            className="btn-elvish mr-4"
          >
            {syncing ? 'Syncing...' : 'Sync from Stripe'}
          </button>
        )}
        
        <button
          onClick={forcePro}
          disabled={syncing}
          className="btn-elvish bg-red-600 hover:bg-red-700"
        >
          {syncing ? 'Processing...' : 'Force Pro Status (Emergency)'}
        </button>
      </div>

      {debugData && (
        <div className="space-y-6">
          <div className="bg-parchment p-4 rounded-lg border border-gold/20">
            <h2 className="text-lg font-cinzel text-forest mb-2">User Info</h2>
            <p><strong>User ID:</strong> {debugData.userId}</p>
            <p><strong>Is Pro (Function):</strong> {debugData.isProFunction ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Timestamp:</strong> {new Date(debugData.timestamp).toLocaleString()}</p>
          </div>

          <div className="bg-parchment p-4 rounded-lg border border-gold/20">
            <h2 className="text-lg font-cinzel text-forest mb-2">Supabase Subscription</h2>
            {debugData.supabaseSubscription ? (
              <pre className="text-sm bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugData.supabaseSubscription, null, 2)}
              </pre>
            ) : (
              <p>❌ No subscription record found in Supabase</p>
            )}
            {debugData.supabaseError && (
              <p className="text-red-600 mt-2"><strong>Error:</strong> {debugData.supabaseError}</p>
            )}
          </div>

          <div className="bg-parchment p-4 rounded-lg border border-gold/20">
            <h2 className="text-lg font-cinzel text-forest mb-2">Stripe Data</h2>
            {debugData.stripeData ? (
              debugData.stripeData.error ? (
                <p className="text-red-600">{debugData.stripeData.error}</p>
              ) : (
                <div>
                  <h3 className="font-semibold mb-2">Customer:</h3>
                  <pre className="text-sm bg-white p-2 rounded overflow-auto mb-4">
                    {JSON.stringify(debugData.stripeData.customer, null, 2)}
                  </pre>
                  <h3 className="font-semibold mb-2">Subscriptions:</h3>
                  <pre className="text-sm bg-white p-2 rounded overflow-auto">
                    {JSON.stringify(debugData.stripeData.subscriptions, null, 2)}
                  </pre>
                </div>
              )
            ) : (
              <p>No Stripe customer ID available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}