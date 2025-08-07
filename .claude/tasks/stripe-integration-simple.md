# Stripe Integration - Simple Limits Model

## Pricing Model
**Free Users:**
- Unlimited topic browsing
- Create up to 10 topics per month
- Create up to 50 flashcards per topic
- Basic study mode
- Community contributions (with attribution)

**Pro Users ($4.99/month):**
- Everything in Free
- Unlimited topics
- Unlimited flashcards

## Implementation Plan

### Phase 1: Database Schema (Day 1)
1. Add user_subscriptions table to track Stripe subscriptions
2. Add usage tracking tables for limits enforcement
3. Update existing user flow to check limits

### Phase 2: Limit Enforcement (Day 2)
1. Add middleware to check topic/card creation limits
2. Update topic creation modal with limit warnings
3. Update card creation with limit warnings
4. Add usage display in UI ("7/10 topics this month")

### Phase 3: Stripe Integration (Day 3-4)
1. Set up Stripe checkout flow
2. Create webhook handlers for subscription events
3. Add upgrade prompts and buttons throughout UI
4. Handle subscription status checking

### Phase 4: UI Polish (Day 5)
1. Add subscription status to user profile
2. Create beautiful upgrade modals
3. Add limit reached states
4. Test full flow end-to-end

## Technical Implementation

### Database Schema
```sql
-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_type TEXT, -- monthly, yearly
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (reset monthly)
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- '2024-08' format
  topics_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);
```

### API Endpoints Needed
- `GET /api/user/subscription` - Check subscription status
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe events
- `GET /api/user/usage` - Check current usage limits

### UI Components
- Upgrade button component
- Limit warning components
- Usage progress bars
- Subscription status display

## Benefits of This Approach
1. **Simple to implement** - No new features, just limits
2. **Clear value prop** - "Remove all limits" is easy to understand
3. **Natural friction** - Users hit limits when they're engaged
4. **Easy to test** - Straightforward logic to verify
5. **Quick to deploy** - Can launch in 5 days

## Environment Variables Needed

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (for client-side)
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook endpoint
STRIPE_MONTHLY_PRICE_ID=price_... # Monthly subscription price ID from Stripe
STRIPE_YEARLY_PRICE_ID=price_... # Yearly subscription price ID from Stripe
```

## Next Steps to Deploy

1. **Run the SQL schema** - Execute `memory-garden/lib/stripe-schema.sql` in your Supabase SQL editor
2. **Set up Stripe products** - Configure your monthly ($4.99) and yearly ($50) subscription products in Stripe Dashboard
3. **Add environment variables** - Add the Stripe keys to your Vercel/deployment environment
4. **Set up webhook endpoint** - Configure `https://your-domain.com/api/stripe/webhook` in Stripe Dashboard
5. **Test the flow** - Create a test user and verify limits work correctly

## Testing Checklist

- [ ] Free user can create up to 10 topics per month
- [ ] Free user can create up to 50 cards per topic  
- [ ] Limit warnings appear correctly in UI
- [ ] Upgrade flow works end-to-end
- [ ] Stripe webhooks update subscription status
- [ ] Pro users have unlimited access
- [ ] Usage resets monthly