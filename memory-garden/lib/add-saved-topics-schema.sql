-- Add saved topics functionality
-- This allows users to save topics to their personal "scrolls" collection

-- Create saved_topics table
CREATE TABLE IF NOT EXISTS saved_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- From NextAuth/session
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id) -- Prevent duplicate saves
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_topics_user_id ON saved_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_topics_topic_id ON saved_topics(topic_id);

-- Enable RLS
ALTER TABLE saved_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved topics" ON saved_topics
  FOR SELECT USING (true);

CREATE POLICY "Users can save topics" ON saved_topics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove their saved topics" ON saved_topics
  FOR DELETE USING (true);

-- Create a view for convenient querying of user's scrolls
CREATE OR REPLACE VIEW user_scrolls AS
SELECT 
  t.id as topic_id,
  t.title,
  t.description,
  t.created_at,
  st.saved_at,
  st.user_id,
  COUNT(DISTINCT c.id) as card_count,
  COUNT(DISTINCT r.user_id) as learner_count
FROM topics t
INNER JOIN saved_topics st ON t.id = st.topic_id
LEFT JOIN cards c ON t.id = c.topic_id
LEFT JOIN reviews r ON c.id = r.card_id
GROUP BY t.id, t.title, t.description, t.created_at, st.saved_at, st.user_id;