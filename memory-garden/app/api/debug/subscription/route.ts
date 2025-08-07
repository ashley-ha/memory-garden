import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { upsertUserSubscription } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Check user_subscriptions table
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // Check is_user_pro function result
    const { data: isProResult } = await supabase.rpc('is_user_pro', {
      p_user_id: session.user.id
    })

    let stripeData = null
    if (subscription?.stripe_customer_id) {
      try {
        // Get Stripe customer data
        const customer = await stripe.customers.retrieve(subscription.stripe_customer_id)
        
        // Get Stripe subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          limit: 10
        })
        
        stripeData = {
          customer,
          subscriptions: subscriptions.data
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe data:', stripeError)
        stripeData = { error: 'Failed to fetch Stripe data' }
      }
    }

    return NextResponse.json({
      userId: session.user.id,
      supabaseSubscription: subscription,
      supabaseError: error?.message,
      isProFunction: isProResult,
      stripeData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Debug failed', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { action, stripeCustomerId, stripeSubscriptionId } = body

    if (action === 'sync_from_stripe') {
      if (!stripeCustomerId) {
        return NextResponse.json({ error: 'stripeCustomerId required' }, { status: 400 })
      }

      // Fetch latest subscription from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
        limit: 1
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json({ error: 'No active subscription found in Stripe' }, { status: 404 })
      }

      const subscription = subscriptions.data[0]
      
      // Update Supabase with Stripe data
      const subscriptionData = {
        user_id: session.user.id,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_type: subscription.metadata?.planType || 'monthly',
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }

      await upsertUserSubscription(subscriptionData)

      return NextResponse.json({
        message: 'Subscription synced from Stripe',
        subscriptionData
      })
    }

    if (action === 'force_pro') {
      // Manually set user as pro (for emergency fixes)
      const subscriptionData = {
        user_id: session.user.id,
        stripe_customer_id: stripeCustomerId || 'manual_override',
        stripe_subscription_id: stripeSubscriptionId || 'manual_override',
        status: 'active',
        plan_type: 'monthly',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString(),
      }

      await upsertUserSubscription(subscriptionData)

      return NextResponse.json({
        message: 'User manually set to Pro status',
        subscriptionData
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Debug POST error:', error)
    return NextResponse.json({ error: 'Debug action failed', details: String(error) }, { status: 500 })
  }
}