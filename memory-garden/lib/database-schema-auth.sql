-- Memory Garden Database Schema with Authentication
-- Run this in your Supabase SQL editor

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE, -- From NextAuth
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the cards table to link to authenticated users
ALTER TABLE cards ADD COLUMN IF NOT EXISTS author_id VARCHAR(255);

-- Create RPC function to check username availability
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE username = username_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to increment helpful count
CREATE OR REPLACE FUNCTION increment_helpful_count(card_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE cards 
  SET helpful_count = helpful_count + 1
  WHERE id = card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated helpful_votes table to use user_id instead of session
ALTER TABLE helpful_votes RENAME COLUMN user_session TO user_id;

-- Updated reviews table to use user_id instead of session  
ALTER TABLE reviews RENAME COLUMN user_session TO user_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_cards_author_id ON cards(author_id);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true);