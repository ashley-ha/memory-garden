-- Stripe Integration Schema for Memory Garden
-- Run this in your Supabase SQL editor AFTER running database-schema-auth.sql

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE, -- NextAuth user ID
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, incomplete, etc.
  plan_type VARCHAR(50), -- monthly, yearly
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table (reset monthly)
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- '2024-08' format
  topics_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month_year);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (true); -- We'll handle auth in the application layer

CREATE POLICY "Service can manage subscriptions" ON user_subscriptions
  FOR ALL USING (true); -- Stripe webhooks need full access

-- RLS Policies for user_usage  
CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (true);

CREATE POLICY "Service can manage usage" ON user_usage
  FOR ALL USING (true);

-- Function to get current month usage
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id VARCHAR(255))
RETURNS TABLE(topics_created INTEGER) AS $$
DECLARE
  current_month VARCHAR(7);
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  RETURN QUERY
  SELECT COALESCE(uu.topics_created, 0)::INTEGER
  FROM user_usage uu
  WHERE uu.user_id = p_user_id 
    AND uu.month_year = current_month;
  
  -- If no record exists, return 0
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment topic usage
CREATE OR REPLACE FUNCTION increment_topic_usage(p_user_id VARCHAR(255))
RETURNS INTEGER AS $$
DECLARE
  current_month VARCHAR(7);
  new_count INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  INSERT INTO user_usage (user_id, month_year, topics_created)
  VALUES (p_user_id, current_month, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    topics_created = user_usage.topics_created + 1,
    updated_at = NOW()
  RETURNING topics_created INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is pro
CREATE OR REPLACE FUNCTION is_user_pro(p_user_id VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions 
    WHERE user_id = p_user_id 
      AND status = 'active'
      AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;