-- Memory Garden: Add Flashcard Support and Personal Study Decks
-- Migration to add front/back flashcard functionality and user study deck management

-- Step 1: Add flashcard columns to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS front_content TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS back_content TEXT;

-- Add sources column for both flashcards and regular cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sources TEXT;

-- Step 2: Create user study decks table
CREATE TABLE IF NOT EXISTS user_study_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Session-based user ID
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_study_decks_user_id ON user_study_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_decks_card_id ON user_study_decks(card_id);
CREATE INDEX IF NOT EXISTS idx_user_study_decks_user_card ON user_study_decks(user_id, card_id);

-- Step 4: Enable Row Level Security on new table
ALTER TABLE user_study_decks ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy for user study decks (allow all for MVP)
CREATE POLICY "Allow all operations on user_study_decks" ON user_study_decks FOR ALL USING (true);

-- Step 6: Create helper function to get user's study deck for a topic
CREATE OR REPLACE FUNCTION get_user_study_deck_count(p_user_id TEXT, p_topic_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_study_decks usd
    JOIN cards c ON usd.card_id = c.id
    WHERE usd.user_id = p_user_id AND c.topic_id = p_topic_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to check if card is in user's deck
CREATE OR REPLACE FUNCTION is_card_in_user_deck(p_user_id TEXT, p_card_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_study_decks 
    WHERE user_id = p_user_id AND card_id = p_card_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Add comment to explain card content logic
COMMENT ON TABLE cards IS 'Cards can be either flashcards (front_content and back_content) or general wisdom (content only). If front_content is NOT NULL, treat as flashcard.';