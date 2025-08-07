const Stripe = require('stripe')
require('dotenv').config({ path: './memory-garden/.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
})

async function testPrices() {
  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID
  const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID

  console.log('Testing Stripe price configuration...\n')
  console.log('Monthly Price ID:', monthlyPriceId)
  console.log('Yearly Price ID:', yearlyPriceId)
  console.log('---')

  try {
    // Test monthly price
    console.log('\n🔍 Checking Monthly Price...')
    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId)
    console.log(`✓ Monthly price found`)
    console.log(`  Type: ${monthlyPrice.type}`)
    console.log(`  Amount: $${(monthlyPrice.unit_amount / 100).toFixed(2)}`)
    if (monthlyPrice.recurring) {
      console.log(`  Interval: ${monthlyPrice.recurring.interval}`)
      console.log(`  Interval Count: ${monthlyPrice.recurring.interval_count}`)
    }
    console.log(`  Active: ${monthlyPrice.active}`)

    if (monthlyPrice.type !== 'recurring') {
      console.log('❌ ERROR: Monthly price is not recurring!')
    } else {
      console.log('✅ Monthly price is correctly configured as recurring')
    }

    // Test yearly price
    console.log('\n🔍 Checking Yearly Price...')
    const yearlyPrice = await stripe.prices.retrieve(yearlyPriceId)
    console.log(`✓ Yearly price found`)
    console.log(`  Type: ${yearlyPrice.type}`)
    console.log(`  Amount: $${(yearlyPrice.unit_amount / 100).toFixed(2)}`)
    if (yearlyPrice.recurring) {
      console.log(`  Interval: ${yearlyPrice.recurring.interval}`)
      console.log(`  Interval Count: ${yearlyPrice.recurring.interval_count}`)
    }
    console.log(`  Active: ${yearlyPrice.active}`)

    if (yearlyPrice.type !== 'recurring') {
      console.log('❌ ERROR: Yearly price is not recurring!')
    } else {
      console.log('✅ Yearly price is correctly configured as recurring')
    }

  } catch (error) {
    console.error('❌ Error testing prices:', error.message)
  }
}

testPrices()