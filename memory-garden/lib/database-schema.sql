-- Memory Garden Database Schema
-- Run this in your Supabase SQL editor

-- Topics table
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table  
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('analogy', 'definition', 'knowledge')) NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (for spaced repetition)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('again', 'hard', 'good', 'easy')) NOT NULL,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful votes table
CREATE TABLE helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_session, card_id)
);

-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpful_votes ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for MVP - no auth required)
CREATE POLICY "Allow all operations on topics" ON topics FOR ALL USING (true);
CREATE POLICY "Allow all operations on cards" ON cards FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on helpful_votes" ON helpful_votes FOR ALL USING (true);

-- Create some sample data for testing
INSERT INTO topics (title, description) VALUES
  ('Quantum Entanglement', 'How particles stay mysteriously connected across vast distances'),
  ('Machine Learning', 'Teaching computers to learn and make decisions like humans'),
  ('Ancient Philosophy', 'Timeless wisdom from great thinkers of the past');

-- Sample cards for Quantum Entanglement
INSERT INTO cards (topic_id, type, content, author_name) VALUES
  ((SELECT id FROM topics WHERE title = 'Quantum Entanglement'), 'analogy', 'It''s like two dancers who practiced together for years. Even when they''re in separate rooms, they move in perfect synchronization, as if connected by invisible threads.', 'Emma'),
  ((SELECT id FROM topics WHERE title = 'Quantum Entanglement'), 'definition', 'When two particles share a quantum state and measuring one instantly affects the other, regardless of the distance between them.', 'Marcus');

-- Sample cards for Machine Learning  
INSERT INTO cards (topic_id, type, content, author_name) VALUES
  ((SELECT id FROM topics WHERE title = 'Machine Learning'), 'analogy', 'Like teaching a child to recognize faces by showing them thousands of photos. Eventually, they can identify people they''ve never seen before.', 'Sarah'),
  ((SELECT id FROM topics WHERE title = 'Machine Learning'), 'definition', 'A method of data analysis that automates analytical model building using algorithms that iteratively learn from data.', 'Alex');