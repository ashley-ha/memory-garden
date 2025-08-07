import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Stripe configuration
export const STRIPE_CONFIG = {
  MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || '', // Set this in your env
  YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID || '',   // Set this in your env
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const

export type StripePlanType = 'monthly' | 'yearly'

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession({
  userId,
  email,
  planType,
  successUrl,
  cancelUrl,
}: {
  userId: string
  email?: string
  planType: StripePlanType
  successUrl: string
  cancelUrl: string
}) {
  const priceId = planType === 'monthly' ? STRIPE_CONFIG.MONTHLY_PRICE_ID : STRIPE_CONFIG.YEARLY_PRICE_ID

  if (!priceId) {
    throw new Error(`Price ID not configured for ${planType} plan`)
  }

  // Validate that the price exists and is recurring
  try {
    const price = await stripe.prices.retrieve(priceId)
    if (price.type !== 'recurring') {
      throw new Error(`Price ${priceId} is not a recurring price. Stripe requires recurring prices for subscription mode.`)
    }
    console.log(`Using ${planType} price:`, { id: priceId, type: price.type, interval: price.recurring?.interval })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Invalid price ID ${priceId}: ${error.message}`)
    }
    throw error
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      userId,
      planType,
    },
    subscription_data: {
      metadata: {
        userId,
        planType,
      },
    },
  })

  return session
}