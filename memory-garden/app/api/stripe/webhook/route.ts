import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { upsertUserSubscription } from '@/lib/subscription'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No userId in subscription metadata:', { 
      subscriptionId: subscription.id, 
      metadata: subscription.metadata 
    })
    return
  }
  
  console.log('Processing subscription change:', {
    subscriptionId: subscription.id,
    userId,
    status: subscription.status,
    currentPeriodStart: (subscription as any).current_period_start,
    currentPeriodEnd: (subscription as any).current_period_end
  })

  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan_type: subscription.metadata?.planType || null,
    current_period_start: (subscription as any).current_period_start 
      ? new Date((subscription as any).current_period_start * 1000).toISOString()
      : null,
    current_period_end: (subscription as any).current_period_end 
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }

  await upsertUserSubscription(subscriptionData)
  console.log(`Updated subscription for user ${userId}: ${subscription.status}`)
}